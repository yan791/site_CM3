import os
import sqlite3
from datetime import date, datetime, timedelta
from functools import wraps
from pathlib import Path
from flask import Flask, abort, g, jsonify, request, send_from_directory, session
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.middleware.proxy_fix import ProxyFix

DB = Path(os.environ.get('CM3_DB') or Path(__file__).with_name('cm3.sqlite3'))
# site em React (pasta web/), gerado com "npm run build" dentro de static/site
SITE = Path(__file__).with_name('static') / 'site'
app = Flask(__name__)
app.secret_key = os.environ.get('CM3_SECRET_KEY', 'dev-only-change-this-secret')
if os.environ.get('CM3_REQUIRE_SECRET') == '1' and not os.environ.get('CM3_SECRET_KEY'):
    raise RuntimeError('Configure CM3_SECRET_KEY antes de publicar o site.')
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)
app.config.update(SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE='Lax',
                  SESSION_COOKIE_SECURE=os.environ.get('CM3_COOKIE_SECURE') == '1')

def db():
    if 'db' not in g:
        g.db = sqlite3.connect(DB)
        g.db.row_factory = sqlite3.Row
        g.db.execute('PRAGMA foreign_keys=ON')
    return g.db

@app.teardown_appcontext
def close_db(_):
    conn = g.pop('db', None)
    if conn: conn.close()

def init_db():
    conn = sqlite3.connect(DB)
    conn.executescript('''
    PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS plans(id INTEGER PRIMARY KEY,name TEXT UNIQUE NOT NULL,price REAL NOT NULL,period TEXT NOT NULL,description TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,phone TEXT DEFAULT '',password TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'student',plan_id INTEGER,due_date TEXT,created_at TEXT NOT NULL,FOREIGN KEY(plan_id) REFERENCES plans(id));
    CREATE TABLE IF NOT EXISTS teachers(id INTEGER PRIMARY KEY,name TEXT NOT NULL,specialty TEXT NOT NULL,photo TEXT DEFAULT '');
    CREATE TABLE IF NOT EXISTS classes(id INTEGER PRIMARY KEY,title TEXT NOT NULL,teacher_id INTEGER,weekday INTEGER NOT NULL,time TEXT NOT NULL,capacity INTEGER NOT NULL,FOREIGN KEY(teacher_id) REFERENCES teachers(id));
    CREATE TABLE IF NOT EXISTS bookings(id INTEGER PRIMARY KEY,user_id INTEGER NOT NULL,class_id INTEGER NOT NULL,class_date TEXT NOT NULL,UNIQUE(user_id,class_id,class_date),FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS workouts(id INTEGER PRIMARY KEY,user_id INTEGER NOT NULL,title TEXT NOT NULL,details TEXT NOT NULL,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS attendance(id INTEGER PRIMARY KEY,user_id INTEGER NOT NULL,day TEXT NOT NULL,UNIQUE(user_id,day),FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
    ''')
    if not conn.execute('SELECT 1 FROM plans').fetchone():
        conn.executemany('INSERT INTO plans(name,price,period,description) VALUES(?,?,?,?)', [
            ('Mensal',119.90,'mês','Musculação • avaliação inicial • acompanhamento'),
            ('Trimestral',99.90,'mês','Musculação • aulas coletivas • fidelidade de 3 meses'),
            ('Anual',89.90,'mês','Acesso completo • aulas coletivas • fidelidade de 12 meses')])
        conn.executemany('INSERT INTO teachers(name,specialty) VALUES(?,?)', [
            ('Equipe CM3','Musculação e acompanhamento'),('Instrutor(a) de funcional','Treinamento funcional'),('Instrutor(a) aquático(a)','Natação e hidroginástica')])
        conn.executemany('INSERT INTO classes(title,teacher_id,weekday,time,capacity) VALUES(?,?,?,?,?)', [
            ('Funcional',2,0,'07:00',20),('Funcional',2,2,'07:00',20),('Funcional',2,4,'18:00',20),
            ('Hidroginástica',3,1,'18:30',16),('Hidroginástica',3,3,'18:30',16),('Dança',1,2,'19:00',24),('Natação infantil',3,4,'19:00',18)])
    conn.commit(); conn.close()

def auth(role=None):
    def deco(fn):
        @wraps(fn)
        def wrapped(*args,**kwargs):
            if not session.get('user_id'): return jsonify(error='Faça login para continuar.'),401
            if role and session.get('role') != role: return jsonify(error='Acesso não autorizado.'),403
            return fn(*args,**kwargs)
        return wrapped
    return deco

@app.before_request
def origin_check():
    if request.method in ('POST','PATCH','DELETE'):
        origin=request.headers.get('Origin')
        if origin and origin.rstrip('/') != request.host_url.rstrip('/'): abort(403)

@app.get('/')
def index():
    if not (SITE / 'index.html').exists():
        return 'Site ainda não gerado. Rode "npm run build" dentro da pasta web.', 503
    resp = send_from_directory(SITE, 'index.html')
    resp.headers['Cache-Control'] = 'no-cache'
    return resp

@app.get('/api/public')
def public():
    return jsonify(plans=[dict(x) for x in db().execute('SELECT * FROM plans ORDER BY price DESC')],teachers=[dict(x) for x in db().execute('SELECT * FROM teachers')],classes=[dict(x) for x in db().execute('SELECT c.*,t.name teacher FROM classes c LEFT JOIN teachers t ON t.id=c.teacher_id ORDER BY c.weekday,c.time')])

@app.post('/api/register')
def register():
    d=request.get_json(silent=True) or {}; name=str(d.get('name','')).strip()[:100]; email=str(d.get('email','')).strip().lower()[:150]; password=str(d.get('password',''))
    if len(name)<2 or '@' not in email or len(password)<8: return jsonify(error='Informe nome, e-mail válido e senha com 8 caracteres ou mais.'),400
    try:
        cur=db().execute('INSERT INTO users(name,email,phone,password,role,created_at) VALUES(?,?,?,?,?,?)',(name,email,str(d.get('phone',''))[:30],generate_password_hash(password),'student',datetime.now().isoformat()))
        db().commit()
    except sqlite3.IntegrityError: return jsonify(error='Este e-mail já está cadastrado.'),409
    session.clear(); session.update(user_id=cur.lastrowid,role='student'); return jsonify(ok=True)

@app.post('/api/login')
def login():
    d=request.get_json(silent=True) or {}; u=db().execute('SELECT * FROM users WHERE email=?',(str(d.get('email','')).strip().lower(),)).fetchone()
    if not u or not check_password_hash(u['password'],str(d.get('password',''))): return jsonify(error='E-mail ou senha incorretos.'),401
    session.clear(); session.update(user_id=u['id'],role=u['role']); return jsonify(ok=True,role=u['role'])

@app.post('/api/logout')
def logout(): session.clear(); return jsonify(ok=True)

@app.get('/api/me')
@auth()
def me():
    u=db().execute('SELECT u.id,u.name,u.email,u.phone,u.role,u.due_date,p.name plan,p.price FROM users u LEFT JOIN plans p ON p.id=u.plan_id WHERE u.id=?',(session['user_id'],)).fetchone()
    if not u: session.clear(); return jsonify(error='Sessão inválida.'),401
    uid=u['id']; return jsonify(user=dict(u),workouts=[dict(x) for x in db().execute('SELECT title,details FROM workouts WHERE user_id=?',(uid,))],attendance=db().execute('SELECT COUNT(*) FROM attendance WHERE user_id=?',(uid,)).fetchone()[0],bookings=[dict(x) for x in db().execute('SELECT b.id,b.class_date,c.title,c.time FROM bookings b JOIN classes c ON c.id=b.class_id WHERE b.user_id=? AND b.class_date>=? ORDER BY b.class_date,c.time',(uid,date.today().isoformat()))])

@app.post('/api/bookings')
@auth('student')
def book():
    d=request.get_json(silent=True) or {}
    try: cid=int(d.get('class_id')); day=date.fromisoformat(str(d.get('date')))
    except (ValueError,TypeError): return jsonify(error='Aula ou data inválida.'),400
    lesson=db().execute('SELECT * FROM classes WHERE id=?',(cid,)).fetchone()
    if not lesson or day.weekday()!=lesson['weekday'] or not date.today()<=day<=date.today()+timedelta(days=14): return jsonify(error='Escolha uma data válida nos próximos 14 dias.'),400
    count=db().execute('SELECT COUNT(*) FROM bookings WHERE class_id=? AND class_date=?',(cid,day.isoformat())).fetchone()[0]
    if count>=lesson['capacity']: return jsonify(error='Turma lotada.'),409
    try: db().execute('INSERT INTO bookings(user_id,class_id,class_date) VALUES(?,?,?)',(session['user_id'],cid,day.isoformat())); db().commit()
    except sqlite3.IntegrityError: return jsonify(error='Você já reservou esta aula.'),409
    return jsonify(ok=True)

@app.delete('/api/bookings/<int:item_id>')
@auth('student')
def cancel(item_id): db().execute('DELETE FROM bookings WHERE id=? AND user_id=?',(item_id,session['user_id'])); db().commit(); return jsonify(ok=True)

@app.get('/api/admin')
@auth('admin')
def admin():
    return jsonify(students=[dict(x) for x in db().execute("SELECT u.id,u.name,u.email,u.phone,u.plan_id,u.due_date,p.name plan FROM users u LEFT JOIN plans p ON p.id=u.plan_id WHERE u.role='student' ORDER BY u.id DESC")],plans=[dict(x) for x in db().execute('SELECT * FROM plans')],teachers=[dict(x) for x in db().execute('SELECT * FROM teachers')],classes=[dict(x) for x in db().execute('SELECT c.*,t.name teacher FROM classes c LEFT JOIN teachers t ON t.id=c.teacher_id')])

@app.post('/api/admin/<entity>')
@auth('admin')
def admin_create(entity):
    d=request.get_json(silent=True) or {}
    try:
        if entity=='students':
            if len(str(d.get('password','')))<8: raise ValueError('A senha precisa ter 8 caracteres ou mais.')
            db().execute('INSERT INTO users(name,email,phone,password,role,plan_id,due_date,created_at) VALUES(?,?,?,?,?,?,?,?)',(d['name'].strip(),d['email'].strip().lower(),d.get('phone',''),generate_password_hash(d['password']),'student',d.get('plan_id') or None,d.get('due_date') or None,datetime.now().isoformat()))
        elif entity=='plans': db().execute('INSERT INTO plans(name,price,period,description) VALUES(?,?,?,?)',(d['name'].strip(),float(d['price']),d['period'].strip(),d['description'].strip()))
        elif entity=='teachers': db().execute('INSERT INTO teachers(name,specialty,photo) VALUES(?,?,?)',(d['name'].strip(),d['specialty'].strip(),d.get('photo','')))
        elif entity=='classes': db().execute('INSERT INTO classes(title,teacher_id,weekday,time,capacity) VALUES(?,?,?,?,?)',(d['title'].strip(),int(d['teacher_id']),int(d['weekday']),d['time'],int(d['capacity'])))
        elif entity=='workouts': db().execute('INSERT INTO workouts(user_id,title,details) VALUES(?,?,?)',(int(d['user_id']),d['title'].strip(),d['details'].strip()))
        elif entity=='attendance': db().execute('INSERT INTO attendance(user_id,day) VALUES(?,?)',(int(d['user_id']),d.get('day') or date.today().isoformat()))
        else: abort(404)
        db().commit()
    except (KeyError,ValueError,sqlite3.IntegrityError) as exc: return jsonify(error=str(exc) if isinstance(exc,ValueError) else 'Confira os dados e tente novamente.'),400
    return jsonify(ok=True)

@app.patch('/api/admin/students/<int:uid>')
@auth('admin')
def update_student(uid):
    d=request.get_json(silent=True) or {}; db().execute("UPDATE users SET plan_id=?,due_date=? WHERE id=? AND role='student'",(d.get('plan_id') or None,d.get('due_date') or None,uid)); db().commit(); return jsonify(ok=True)

@app.delete('/api/admin/<entity>/<int:item_id>')
@auth('admin')
def admin_delete(entity,item_id):
    table={'plans':'plans','teachers':'teachers','classes':'classes'}.get(entity)
    if not table: abort(404)
    try: db().execute(f'DELETE FROM {table} WHERE id=?',(item_id,)); db().commit()
    except sqlite3.IntegrityError: return jsonify(error='Este item está em uso.'),409
    return jsonify(ok=True)

@app.cli.command('create-admin')
def create_admin():
    import getpass
    email=input('E-mail: ').strip().lower(); name=input('Nome: ').strip(); password=getpass.getpass('Senha (mínimo 8 caracteres): ')
    if not name or '@' not in email or len(password)<8: raise SystemExit('Dados inválidos.')
    with app.app_context(): db().execute('INSERT INTO users(name,email,password,role,created_at) VALUES(?,?,?,?,?)',(name,email,generate_password_hash(password),'admin',datetime.now().isoformat())); db().commit()
    print('Administrador criado.')

init_db()
if __name__=='__main__': app.run(debug=os.environ.get('FLASK_DEBUG')=='1')

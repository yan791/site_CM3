import { motion } from 'motion/react'
import { usePublico } from '../lib/api'
import { nivel } from '../dados/site'
import { MarcaCM3 } from '../components/Logo'

/* Nível 05. Professores cadastrados no painel administrativo. */
export function Equipe() {
  const { teachers } = usePublico()
  return (
    <section id="equipe" className="equipe claro">
      <div className="conteudo">
        <header className="eq-topo">
          <p className="rotulo">Nível {nivel('equipe')} · Equipe</p>
          <h2 className="titulo">
            Gente que
            <br />
            <em>acompanha você.</em>
          </h2>
          <p className="texto">Profissionais para orientar seus treinos e comemorar cada passo da sua evolução.</p>
        </header>
        <div className="eq-grade">
          {teachers.map((t, n) => (
            <motion.article
              key={t.id}
              className="prof"
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.95, delay: n * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="prof-foto">
                {t.photo ? (
                  <img src={t.photo} alt={`Foto de ${t.name}`} loading="lazy" />
                ) : (
                  <div className="prof-vazio">
                    <MarcaCM3 />
                    <span>Foto em breve</span>
                  </div>
                )}
              </div>
              <div className="prof-info">
                <span className="prof-num">{String(n + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{t.name}</h3>
                  <p>{t.specialty}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
        <p className="nota centro">Equipe demonstrativa. Cadastre nomes, fotos e especialidades reais no painel administrativo.</p>
      </div>
    </section>
  )
}

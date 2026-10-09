/*
  Camada fixa atrás de tudo: o preto grafite da CM3 com dois brilhos que derivam
  devagar (turquesa e verde-petróleo) e um grão leve.
  As seções escuras são transparentes e deixam esse ambiente aparecer.
*/
export function Ambiente() {
  return (
    <div className="ambiente" aria-hidden="true">
      <i className="amb-turquesa" />
      <i className="amb-petroleo" />
      <i className="amb-grao" />
    </div>
  )
}

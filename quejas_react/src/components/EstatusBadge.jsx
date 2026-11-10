export const ETIQUETAS_ESTATUS = {
  levantada: '🟡 Levantada',
  'en proceso': '🔵 En proceso',
  atendida: '🟢 Atendida',
};

export default function EstatusBadge({ estatus }) {
  return (
    <span className={`badge-estatus estatus-${estatus.replace(' ', '-')}`}>
      {ETIQUETAS_ESTATUS[estatus] || estatus}
    </span>
  );
}

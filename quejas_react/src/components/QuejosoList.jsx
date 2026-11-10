export default function QuejosoList({ quejosos }) {
  return (
    <section className="tarjeta">
      <h2>Padrón de Quejosos ({quejosos.length})</h2>
      <div className="tabla-responsive">
        <table>
          <thead>
            <tr>
              <th>ID Quejoso</th>
              <th>Clave (Matrícula)</th>
              <th>Nombre</th>
              <th>Carrera</th>
            </tr>
          </thead>
          <tbody>
            {quejosos.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>
                  No hay quejosos registrados.
                </td>
              </tr>
            ) : (
              quejosos.map((item) => (
                <tr key={item.id_quejoso}>
                  <td>#{item.id_quejoso}</td>
                  <td><strong>{item.clave}</strong></td>
                  <td>{item.nombre}</td>
                  <td>{item.carrera}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
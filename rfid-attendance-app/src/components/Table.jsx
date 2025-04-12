import "./Table.css";

export default function Table({ data }) {
  return (
    <div className="table-wrapper">
      <table className="custom-table">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>وقت الدخول</th>
            <th>وقت الخروج</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.name}</td>
              <td>{formatDate(entry.check_in)}</td>
              <td>{entry.check_out ? formatDate(entry.check_out) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleString("ar-EG", {
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
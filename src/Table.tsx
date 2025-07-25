import { useState, useEffect } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "tailwindcss";

const Table = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { field: "title", header: "Title" },
    { field: "place_of_origin", header: "Origin" },
    { field: "artist_display", header: "Artist" },
    { field: "inscriptions", header: "Inscriptions" },
    { field: "date_start", header: "Start Date" },
    { field: "date_end", header: "End Date" },
  ];

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          "https://api.artic.edu/api/v1/artworks?page=1"
        );
        setArtworks(response.data.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold text-gray-700">
          Loading artworks...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Art Institute of Chicago Artworks
      </h1>
      <div className="card bg-white p-6 rounded-lg shadow-lg">
        <DataTable
          value={artworks}
          showGridlines
          tableStyle={{ minWidth: "50rem" }}
          className="border-separate border-spacing-x-6 border-spacing-y-2"
        >
          {columns.map((col) => (
            <Column
              key={col.field}
              field={col.field}
              header={col.header}
              body={(rowData) => (
                <span className="text-gray-800 px-4 py-2 block">
                  {rowData[col.field]}
                </span>
              )}
            />
          ))}
        </DataTable>
      </div>
    </div>
  );
};

export default Table;

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator, type PaginatorPageChangeEvent } from "primereact/paginator";
import {
  InputNumber,
  type InputNumberValueChangeEvent,
} from "primereact/inputnumber";
import { Button } from "primereact/button";

const Table = () => {
  type Artwork = {
    id: number;
    title?: string;
    place_of_origin?: string;
    artist_display?: string;
    inscriptions?: string;
    date_start?: string | number;
    date_end?: string | number;
  };

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [first, setFirst] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [value1, setValue1] = useState<number | null>(null);
  const [allSelectedArtworkIds, setAllSelectedArtworkIds] = useState<
    Set<number>
  >(new Set());

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    const newPage = event.first / 12 + 1;
    setFirst(event.first);
    setCurrentPage(newPage);
  };

  const columns = [
    { field: "title", header: "Title" },
    { field: "place_of_origin", header: "Origin" },
    { field: "artist_display", header: "Artist" },
    { field: "inscriptions", header: "Inscriptions" },
    { field: "date_start", header: "Start Date" },
    { field: "date_end", header: "End Date" },
  ];
  const fetchArtworks = async (currentPage = 1) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${currentPage}`
      );
      //console.log(currentPage);
      console.log(response.data.data);

      setArtworks(response.data.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks(currentPage);
  }, [currentPage]);
  

  const onRowSelectChange = (e: { value: Artwork[] }) => {
    const currentSelectedOnPage = e.value;
    const newAllSelectedArtworkIds = new Set(allSelectedArtworkIds);

    
    const currentArtworkIdsOnPage = new Set(
      artworks.map((artwork) => artwork.id)
    );

    
    artworks.forEach((artwork) => {
      if (
        currentSelectedOnPage.some((selected) => selected.id === artwork.id)
      ) {
       
        newAllSelectedArtworkIds.add(artwork.id);
      } else if (currentArtworkIdsOnPage.has(artwork.id)) {
        
        newAllSelectedArtworkIds.delete(artwork.id);
      }
    });

    setAllSelectedArtworkIds(newAllSelectedArtworkIds);
  };
   const rowSelect = useMemo(() => {
    return artworks.filter((artwork) =>
      allSelectedArtworkIds.has(artwork.id)
    );
  }, [artworks, allSelectedArtworkIds]);

   const handleSelectRows = async () => {
    if (value1 === null || value1 <= 0) {
      return; 
    }

    setAllSelectedArtworkIds((prevIds) => {
      const newIds = new Set(prevIds);

     
      artworks.slice(0, value1).forEach((artwork) => newIds.add(artwork.id));
      return newIds;
    });

    const pageSize = 12; 
    const recordsOnCurrentPage = artworks.length;

   
    if (value1 > recordsOnCurrentPage) {
      const recordsToFetch = value1 - recordsOnCurrentPage;

      
      let nextPageToFetch = currentPage + 1;
      let fetchedCount = 0;

      while (fetchedCount < recordsToFetch && nextPageToFetch <= ( 129230 / pageSize) + 1) { 
        try {
          const response = await axios.get(
            `https://api.artic.edu/api/v1/artworks?page=${nextPageToFetch}`
          );
          const newArtworks = response.data.data;

          if (newArtworks.length === 0) {
            
            break;
          }

          setAllSelectedArtworkIds((prevIds) => {
            const newIds = new Set(prevIds);
           
            newArtworks.slice(0, recordsToFetch - fetchedCount).forEach((artwork: Artwork) => {
              newIds.add(artwork.id);
            });
            return newIds;
          });

          fetchedCount += newArtworks.length;
          nextPageToFetch++;
        } catch (err) {
          console.error("Error fetching additional data:", err);
          break; 
        }
      }
    }}

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
      <div className="mb-4">
        <label
          htmlFor="row-value"
          className="font-bold block mb-2 text-gray-800"
        >
          Enter number of rows you want to select 
        </label>
        <div className="flex gap-4">
          <InputNumber
            id="row-value"
            value={value1}
            onValueChange={(e: InputNumberValueChangeEvent) =>
              setValue1(e.value ?? null)
            }
            className="text-gray-800 border-2"
          />
          <Button label="Select" onClick={handleSelectRows} />
        </div>
         <div className="mt-2 text-gray-600">
            Total selected items across all pages: {allSelectedArtworkIds.size}
        </div>
      </div>
      <div className="card bg-white p-6 rounded-lg shadow-lg">
        <DataTable
          dataKey="id"
          value={artworks}
          showGridlines
          tableStyle={{ minWidth: "50rem" }}
          className="border-separate border-spacing-x-6 border-spacing-y-2"
          selection={rowSelect} 
          onSelectionChange={onRowSelectChange} 
          selectionMode="multiple"
        >
          <Column
            selectionMode="multiple"
            headerStyle={{ width: "3rem" }}
            header={() => null}
          />

          {columns.map((col) => (
            <Column
              key={col.field}
              field={col.field}
              header={col.header}
              headerClassName="text-gray-700 font-bold"
              body={(rowData) => {
                console.log("Row:", rowData.id); 
                return (
                  <span className="text-gray-800 px-4 py-2 block">
                    {rowData?.[col.field] ?? "-"}
                  </span>
                );
              }}
            />
          ))}
        </DataTable>
      </div>
      <div className="card">
        <Paginator
          first={first}
          rows={12}
          totalRecords={129230}
          //rowsPerPageOptions={[12]}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default Table;

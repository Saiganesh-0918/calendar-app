// import React, { useState, useEffect } from "react";
// import { FaCalendarAlt } from "react-icons/fa"; // calendar icon
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import * as XLSX from "xlsx";

// // Custom Input Component for DatePicker
// const CustomInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
//   <div
//     onClick={onClick}
//     ref={ref}
//     style={{
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "space-between",
//       border: "1px solid #ccc",
//       borderRadius: "4px",
//       padding: "8px 12px",
//       width: "200px",
//       cursor: "pointer",
//       background: "#fff"
//     }}
//   >
//     <span style={{ color: value ? "#000" : "#999" }}>{value || placeholder}</span>
//     <FaCalendarAlt style={{ marginLeft: "8px", color: "#555" }} />
//   </div>
// ));

// const CalendarPage = () => {
//   const [excelData, setExcelData] = useState(null);
//   const [fileName, setFileName] = useState("");
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [filterColumn, setFilterColumn] = useState("");
//   const [filterValue, setFilterValue] = useState("");
//   const [filters, setFilters] = useState([]);
//   const [applyFilter, setApplyFilter] = useState(false);
//   const [columns, setColumns] = useState([]);
//   const [filterOptions, setFilterOptions] = useState([]);

//   useEffect(() => {
//     if (excelData && filterColumn && filterColumn.toLowerCase() !== "date") {
//       const uniqueValues = [
//         ...new Set(excelData.map(row => row[filterColumn]).filter(v => v !== undefined && v !== ""))
//       ];
//       setFilterOptions(uniqueValues);
//     } else {
//       setFilterOptions([]);
//     }
//   }, [filterColumn, excelData]);
//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     setFileName(file.name);
    
//     const reader = new FileReader();
//     reader.onload = (event) => {
//       const wb = XLSX.read(event.target.result, { type: "array", cellDates: true });
//       const sheet = wb.Sheets[wb.SheetNames[0]];
//       const data = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: "" });

//       setExcelData(data);
//       // Extract columns for filtering
//       const extractedColumns = Object.keys(data[0] || {});
//       setColumns(extractedColumns);
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   const downloadFilteredFile = () => {
//     if (!excelData) {
//       alert("No data to download!");
//       return;
//     }

//     let filteredData = excelData;
//     // Remove ₹ symbol from all cells
//     filteredData = filteredData.map((row) => {
//       const newRow = {};
//       Object.keys(row).forEach((key) => {
//         newRow[key] = typeof row[key] === "string" ? row[key].replace(/₹/g, "") : row[key];
//       });
//       return newRow;
//     });
//     // Filter by Date Range
//     if (startDate && endDate) {
//       filteredData = filteredData.filter((row) => {
//         const rowDate = new Date(row["Date"]); // Assuming the column name is "Date"
//         return rowDate >= startDate && rowDate <= endDate;
//       });
//     }

//     // Filter by specific column
//     // if (applyFilter && filterColumn && filterValue) {
//     //   filteredData = filteredData.filter((row) => {
//     //     return row[filterColumn] && row[filterColumn].toString().toLowerCase().includes(filterValue.toLowerCase());
//     //   });
//     // }
//     if (applyFilter && filters.length > 0) {
//       // Group filters by column
//       const filtersByColumn = filters.reduce((acc, { column, value }) => {
//         if (!acc[column]) {
//           acc[column] = [];
//         }
//         acc[column].push(value);
//         return acc;
//       }, {});

//       // Apply filters for each column
//       Object.entries(filtersByColumn).forEach(([column, values]) => {
//         filteredData = filteredData.filter(row => {
//           const cellValue = row[column]?.toString().toLowerCase() || "";
          
//           // If any of the values for this column is empty, include the row
//           if (values.includes("")) {
//             return true;
//           }
          
//           // Check if the cell value matches any of the filter values
//           return values.some(value => cellValue.includes(value.toLowerCase()));
//         });
//       });
//     }
    
//     if (filteredData.length === 0) {
//       alert("No data matches your filter!");
//       return;
//     }

//     const ws = XLSX.utils.json_to_sheet(filteredData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Filtered Data");
//     const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//     const blob = new Blob([excelBuffer], {
//       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     });

   
//     if ('showSaveFilePicker' in window) {
//       // Modern browser with File System Access API
//       (async () => {
//         const handle = await window.showSaveFilePicker({
//           suggestedName: fileName.replace(".xlsx", "-filtered.xlsx"),
//           types: [
//             {
//               description: 'Excel Files',
//               accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
//             }
//           ]
//         });
//         const writable = await handle.createWritable();
//         await writable.write(blob);
//         await writable.close();
//         alert("File saved successfully!");
//       })();
//     } else {
//       // Fallback for older browsers
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = fileName.replace(".xlsx", "-filtered.xlsx");
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);
//     }
    
//   };

//   return (
//     <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
//       <h2>Filter and Download Data</h2>

//       <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
//         <div>
//           <label>From Date:</label>
//           <DatePicker
//             selected={startDate}
//             onChange={(date) => {
//               setStartDate(date);
//               if (endDate && date > endDate) setEndDate(null);
//             }}
//             selectsStart
//             startDate={startDate}
//             endDate={endDate}
//             placeholderText="Start date"
//             dateFormat="dd/MM/yyyy"
//             customInput={<CustomInput placeholder="Start date" />}
//             renderCustomHeader={({
//               date,
//               changeYear,
//               changeMonth,
//               decreaseMonth,
//               increaseMonth,
//               decreaseYear,
//               increaseYear,
//               prevMonthButtonDisabled,
//               nextMonthButtonDisabled
//             }) => (
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   margin: 10
//                 }}
//               >
//                 <div style={{ display: "flex", gap: "0.5rem" }}>
//                   <button onClick={decreaseYear} type="button">{'<<'}</button>
//                   <button onClick={decreaseMonth} type="button" disabled={prevMonthButtonDisabled}>{'<'}</button>
//                 </div>
            
//                 <span style={{ fontWeight: "bold" }}>
//                   {date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}
//                 </span>
            
//                 <div style={{ display: "flex", gap: "0.5rem" }}>
//                   <button onClick={increaseMonth} type="button" disabled={nextMonthButtonDisabled}>{'>'}</button>
//                   <button onClick={increaseYear} type="button">{'>>'}</button>
//                 </div>
//               </div>
//             )}
//           />
//         </div>

//         <div>
//           <label>To Date:</label>
//           <DatePicker
//             selected={endDate}
//             onChange={(date) => setEndDate(date)}
//             selectsEnd
//             startDate={startDate}
//             endDate={endDate}
//             minDate={startDate}
//             placeholderText="End date"
//             dateFormat="dd/MM/yyyy"
//             customInput={<CustomInput placeholder="End date" />}
//             renderCustomHeader={({
//                             date,
//                             changeYear,
//                             changeMonth,
//                             decreaseMonth,
//                             increaseMonth,
//                             decreaseYear,
//                             increaseYear,
//                             prevMonthButtonDisabled,
//                             nextMonthButtonDisabled
//                           }) => (
//                             <div
//                               style={{
//                                 display: "flex",
//                                 justifyContent: "space-between",
//                                 margin: 10
//                               }}
//                             >
//                               <div style={{ display: "flex", gap: "0.5rem" }}>
//                                 <button onClick={decreaseYear} type="button">{'<<'}</button>
//                                 <button onClick={decreaseMonth} type="button" disabled={prevMonthButtonDisabled}>{'<'}</button>
//                               </div>
                          
  
//                               <span style={{ fontWeight: "bold" }}>
//                                 {date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}
//                               </span>
                          
  
//                               <div style={{ display: "flex", gap: "0.5rem" }}>
//                                 <button onClick={increaseMonth} type="button" disabled={nextMonthButtonDisabled}>{'>'}</button>
//                                 <button onClick={increaseYear} type="button">{'>>'}</button>
//                               </div>
//                             </div>
//                           )}
//           />
//         </div>
//       </div>

//       <div style={{ marginTop: "1rem" }}>
//         <label>Filter by Column:</label>
//         {/* Dropdown for column selection */}
//         <select
//           value={filterColumn}
//           onChange={(e) => setFilterColumn(e.target.value)}
//           style={{ padding: "5px", marginLeft: "10px" }}
//         >
//           <option value="">Select Column</option>
//           {columns.map((col, index) => (
//             <option key={index} value={col}>
//               {col}
//             </option>
//           ))}
//         </select>
//         {filterColumn && filterColumn.toLowerCase() !== "date" && (
//   <>
//     <label>Filter Value:</label>
//     <select
//       // type="text"
//       // placeholder="Enter value to filter (e.g., name, status)"
//       value={filterValue}
//       onChange={(e) => setFilterValue(e.target.value)}
//       style={{ padding: "5px", marginLeft: "10px" }}
//     >
//       <option value="">Select Value</option>
//       {filterOptions.map((val, idx) => (
//         <option key={idx} value={val}>
//           {val}
//         </option>
//       ))}
//     </select>
//     <button
//       onClick={() => {
//         // if (filterColumn && filterValue) {
//         //   setFilters((prev) => [
//         //     ...prev,
//         //     { column: filterColumn, value: filterValue}
//         //   ]);
//         //   setFilterValue("");
//         //   setFilterColumn("");
//         // }
//         if (filterColumn) {
//           setFilters((prev) => [
//             ...prev,
//             { column: filterColumn, value: filterValue } // allow empty value
//           ]);
//           setFilterValue("");
//           setFilterColumn("");
//         }
        
//       }}
//       style={{marginLeft: "10px", padding: "5px 10px"}}
//       >
//         Add Filter
//       </button>
//   </>
// )}

//         <button onClick={() => setApplyFilter(!applyFilter)} style={{ padding: "5px 10px", marginLeft: "10px" }}>
//           {applyFilter ? "Remove Filter" : "Apply Filter"}
//         </button>
//       </div>
//       {/* Display applied filters */}
// {filters.length > 0 && (
//   <div style={{ marginTop: "1rem" }}>
//     <h4>Applied Filters:</h4>
//     <ul>
//       {filters.map((f, i) => (
//         <li key={i}>
//           {f.column} = {f.value}{" "}
//           <button onClick={() => {
//             setFilters(filters.filter((_, idx) => idx !== i));
//           }} style={{ marginLeft: "5px" }}>
//             ❌
//           </button>
//         </li>
//       ))}
//     </ul>
//   </div>
// )}
//       <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
//         <input
//           type="file"
//           accept=".xlsx"
//           onChange={handleFileUpload}
//           style={{ padding: "10px", border: "1px solid #ccc" }}
//         />
//         <button onClick={downloadFilteredFile} style={{ padding: "10px", border: "1px solid #ccc", cursor: "pointer" }}>
//           Download
//         </button>
//       </div>

//       {fileName && <p>Uploaded File: {fileName}</p>}
//     </div>
//   );
// };

// export default CalendarPage;

// import React, { useState, useEffect } from "react";
// import { FaCalendarAlt } from "react-icons/fa";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import axios from "axios";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";


// // Custom Input for DatePicker
// const CustomInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
//   <div
//     onClick={onClick}
//     ref={ref}
//     style={{
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "space-between",
//       border: "1px solid #ccc",
//       borderRadius: "4px",
//       padding: "8px 12px",
//       width: "200px",
//       cursor: "pointer",
//       background: "#fff"
//     }}
//   >
//     <span style={{ color: value ? "#000" : "#999" }}>{value || placeholder}</span>
//     <FaCalendarAlt style={{ marginLeft: "8px", color: "#555" }} />
//   </div>
// ));

// const CalendarPage = () => {
//   const [excelData, setExcelData] = useState([]);
//   const [file, setFile] = useState(null);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [retailer, setRetailer] = useState("");
//   const [type, setType] = useState("");
//   const [filters, setFilters] = useState({});
// const [columns, setColumns] = useState([]);

//   const handleFileUpload = async () => {
//     if (!file) return alert("Please select a file.");
//     const formData = new FormData();
//     formData.append("file", file);
//     try {
//       const res = await axios.post("http://localhost:5000/upload", formData);
//       alert(res.data.message);
//       const colRes = await axios.get("http://localhost:5000/columns");
//       setColumns(colRes.data.filter(col => col !== "id")); // remove id if not needed

//     } catch (err) {
//       alert("Upload failed!");
//       console.error(err);
//     }
//   };

//   const handleDownload = () => {
//     const worksheet = XLSX.utils.json_to_sheet(excelData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Data");
  
//     const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
//     const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
//     saveAs(blob, "filtered_data.xlsx");
//   };
//   {excelData.length > 0 && (
//   <button onClick={handleDownload} style={{ marginTop: "10px" }}>
//     Download as Excel
//   </button>
// )}

  

//   const handleFilter = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/transactions", {
//         params: filters
//       });
//       setExcelData(res.data);
//     } catch (err) {
//       console.error(err);
//       alert("Error filtering data");
//     }
//   };

//   return (
//     <div style={{ padding: "2rem", fontFamily: "Arial" }}>
//       <h2>Upload Excel and Filter Transactions</h2>

//       {/* Upload */}
//       <input
//         type="file"
//         accept=".xlsx"
//         onChange={(e) => setFile(e.target.files[0])}
//       />
//       <button onClick={handleFileUpload} style={{ marginLeft: "10px" }}>
//         Upload
//       </button>
      

//       {/* Filters */}
//       <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
//         <div>
//           <label>From Date:</label>
//           <DatePicker
//             selected={startDate}
//             onChange={(date) => {
//               setStartDate(date);
//               if (endDate && date > endDate) setEndDate(null);
//             }}
//             selectsStart
//             startDate={startDate}
//             endDate={endDate}
//             placeholderText="Start date"
//             dateFormat="dd/MM/yyyy"
//             customInput={<CustomInput placeholder="Start date" />}
//             renderCustomHeader={({
//               date,
//               decreaseYear,
//               increaseYear,
//               decreaseMonth,
//               increaseMonth,
//               prevMonthButtonDisabled,
//               nextMonthButtonDisabled
//             }) => (
//               <div style={{ display: "flex", justifyContent: "space-between", margin: 10 }}>
//                 <div style={{ display: "flex", gap: "0.5rem" }}>
//                   <button onClick={decreaseYear} type="button">{'<<'}</button>
//                   <button onClick={decreaseMonth} type="button" disabled={prevMonthButtonDisabled}>{'<'}</button>
//                 </div>
//                 <span style={{ fontWeight: "bold" }}>
//                   {date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}
//                 </span>
//                 <div style={{ display: "flex", gap: "0.5rem" }}>
//                   <button onClick={increaseMonth} type="button" disabled={nextMonthButtonDisabled}>{'>'}</button>
//                   <button onClick={increaseYear} type="button">{'>>'}</button>
//                 </div>
//               </div>
//             )}
//           />
//         </div>

//         <div>
//           <label>To Date:</label>
//           <DatePicker
//             selected={endDate}
//             onChange={(date) => setEndDate(date)}
//             selectsEnd
//             startDate={startDate}
//             endDate={endDate}
//             minDate={startDate}
//             placeholderText="End date"
//             dateFormat="dd/MM/yyyy"
//             customInput={<CustomInput placeholder="End date" />}
//             renderCustomHeader={({
//               date,
//               decreaseYear,
//               increaseYear,
//               decreaseMonth,
//               increaseMonth,
//               prevMonthButtonDisabled,
//               nextMonthButtonDisabled
//             }) => (
//               <div style={{ display: "flex", justifyContent: "space-between", margin: 10 }}>
//                 <div style={{ display: "flex", gap: "0.5rem" }}>
//                   <button onClick={decreaseYear} type="button">{'<<'}</button>
//                   <button onClick={decreaseMonth} type="button" disabled={prevMonthButtonDisabled}>{'<'}</button>
//                 </div>
//                 <span style={{ fontWeight: "bold" }}>
//                   {date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}
//                 </span>
//                 <div style={{ display: "flex", gap: "0.5rem" }}>
//                   <button onClick={increaseMonth} type="button" disabled={nextMonthButtonDisabled}>{'>'}</button>
//                   <button onClick={increaseYear} type="button">{'>>'}</button>
//                 </div>
//               </div>
//             )}
//           />
//         </div>
//       </div>

//       <div style={{ marginTop: "1rem" }}>
//   <h4>Filter by Column</h4>
//   {columns.map((col) => (
//     <div key={col} style={{ marginTop: "0.5rem" }}>
//       <label>{col}: </label>
//       <input
//         type="text"
//         value={filters[col] || ""}
//         onChange={(e) =>
//           setFilters((prev) => ({
//             ...prev,
//             [col]: e.target.value
//           }))
//         }
//       />
//     </div>
//   ))}
//   {/* <button onClick={handleFilter} style={{ marginTop: "1rem" }}>
//     Apply Filters
//   </button>
// </div> */}

//         <label>Transaction Type:</label>
//         <select
//           value={type}
//           onChange={(e) => setType(e.target.value)}
//           style={{ marginLeft: "10px" }}
//         >
//           <option value="">All</option>
//           <option value="Credit">Credit</option>
//           <option value="Debit">Debit</option>
//         </select>
//         <button onClick={handleFilter} style={{ marginLeft: "10px" }}>
//           Apply Filters
//         </button>
//       </div>

//       {/* Dynamic Table */}
//       <h3 style={{ marginTop: "2rem" }}>Filtered Data</h3>
//       {excelData.length > 0 ? (
//         <table border="1" cellPadding="5">
//           <thead>
//             <tr>
//               {Object.keys(excelData[0]).map((col) => (
//                 <th key={col}>{col}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {excelData.map((row, rowIndex) => (
//               <tr key={rowIndex}>
//                 {Object.values(row).map((val, colIndex) => (
//                   <td key={colIndex}>{val}</td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : (
//         <p>No results yet.</p>
//       )}
//     </div>
//   );
// };

// export default CalendarPage;

// ✅ Clean and fixed CalendarPage.jsx with upload, filter, date pickers, and download

// CalendarPage.jsx - Fully updated version with all final fixes

// CalendarPage.jsx - Fully fixed with hover, arrows, no default date, and clean filter UI

// CalendarPage.jsx - Fixed: show filter dropdown values and enable download button when data exists

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import { FaCalendarAlt } from "react-icons/fa";

// const CustomInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
//   <div
//     onClick={onClick}
//     ref={ref}
//     style={{
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "space-between",
//       border: "1px solid #ccc",
//       borderRadius: "4px",
//       padding: "8px 12px",
//       width: "200px",
//       cursor: "pointer",
//       background: "#fff"
//     }}
//   >
//     <span style={{ color: value ? "#000" : "#999" }}>{value || placeholder}</span>
//     <FaCalendarAlt style={{ marginLeft: "8px", color: "#555" }} />
//   </div>
// ));

// const CalendarPage = () => {
//   const [file, setFile] = useState(null);
//   const [data, setData] = useState([]);
//   const [columns, setColumns] = useState([]);
//   const [filters, setFilters] = useState([]);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [selectedColumn, setSelectedColumn] = useState("");
//   const [filterValue, setFilterValue] = useState("");
//   const [filterOptions, setFilterOptions] = useState([]);

//   const handleFileUpload = async () => {
//     if (!file) return alert("Please select a file.");
//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const res = await axios.post("http://localhost:5000/upload", formData);
//       alert(res.data.message);
//       const colRes = await axios.get("http://localhost:5000/columns");
//       setColumns(colRes.data.filter(c => c !== "id"));
//       setData([]);
//     } catch (err) {
//       console.error("Upload failed:", err);
//       alert("Upload failed: " + (err.response?.data?.error || err.message));
//     }
//   };

//   useEffect(() => {
//     if (selectedColumn) {
//       axios
//         .get(`http://localhost:5000/column-values?column=${selectedColumn}`)
//         .then(res => {
//           setFilterOptions(res.data);
//         })
//         .catch(err => {
//           console.error("Failed to fetch filter options:", err);
//           setFilterOptions([]);
//         });
//     } else {
//       setFilterOptions([]);
//     }
//   }, [selectedColumn]);
  

//   const handleFilter = async () => {
//     const query = {};
//     filters.forEach(({ column, value }) => {
//       query[column] = value;
//     });
//     if (startDate) query.from = startDate.toISOString().split("T")[0];
//     if (endDate) query.to = endDate.toISOString().split("T")[0];

//     try {
//       const res = await axios.get("http://localhost:5000/transactions", { params: query });
//       setData(res.data);
//     } catch (err) {
//       console.error("Filter failed:", err);
//       alert("Filter failed");
//     }
//   };

//   const handleDownload = () => {
//     if (data.length === 0) return alert("No data to download");
//     const worksheet = XLSX.utils.json_to_sheet(data);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Data");
//     const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
//     saveAs(new Blob([buffer]), "filtered_data.xlsx");
//   };

//   return (
//     <div style={{ padding: "2rem", fontFamily: "Arial" }}>
//       <h2>Upload Excel and Filter Transactions</h2>
//       <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files[0])} />
//       <button onClick={handleFileUpload} style={{ marginLeft: "10px" }}>Upload</button>

//       {columns.length > 0 && (
//         <div style={{ marginTop: "2rem" }}>
//           <h4>Filter by Column</h4>

//           <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
//             <div>
//               <label>From Date:</label>
//               <DatePicker
//                 selected={startDate}
//                 onChange={(date) => setStartDate(date)}
//                 dateFormat="yyyy-MM-dd"
//                 placeholderText="Start Date"
//                 customInput={<CustomInput placeholder="Start Date" />}
//                 renderCustomHeader={({ date, decreaseMonth, increaseMonth, decreaseYear, increaseYear }) => (
//                   <div style={{ display: "flex", justifyContent: "space-between", margin: 10 }}>
//                     <div>
//                       <button onClick={decreaseYear}>{"<<"}</button>
//                       <button onClick={decreaseMonth}>{"<"}</button>
//                     </div>
//                     <span>{date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}</span>
//                     <div>
//                       <button onClick={increaseMonth}>{">"}</button>
//                       <button onClick={increaseYear}>{">>"}</button>
//                     </div>
//                   </div>
//                 )}
//               />
//             </div>
//             <div>
//               <label>To Date:</label>
//               <DatePicker
//                 selected={endDate}
//                 onChange={(date) => setEndDate(date)}
//                 dateFormat="yyyy-MM-dd"
//                 placeholderText="End Date"
//                 customInput={<CustomInput placeholder="End Date" />}
//                 minDate={startDate}
//                 renderCustomHeader={({ date, decreaseMonth, increaseMonth, decreaseYear, increaseYear }) => (
//                   <div style={{ display: "flex", justifyContent: "space-between", margin: 10 }}>
//                     <div>
//                       <button onClick={decreaseYear}>{"<<"}</button>
//                       <button onClick={decreaseMonth}>{"<"}</button>
//                     </div>
//                     <span>{date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}</span>
//                     <div>
//                       <button onClick={increaseMonth}>{">"}</button>
//                       <button onClick={increaseYear}>{">>"}</button>
//                     </div>
//                   </div>
//                 )}
//               />
//             </div>
//           </div>

//           <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
//             <select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)}>
//               <option value="">Select Column</option>
//               {columns.map((col) => (
//                 <option key={col} value={col}>{col}</option>
//               ))}
//             </select>

//             {selectedColumn && filterOptions.length > 0 && (
//               <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)}>
//                 <option value="">Select Value</option>
//                 {filterOptions.map((val, idx) => (
//                   <option key={idx} value={val}>{val}</option>
//                 ))}
//               </select>
//             )}

//             <button
//               onClick={() => {
//                 if (selectedColumn) {
//                   setFilters(prev => [...prev, { column: selectedColumn, value: filterValue }]);
//                   setSelectedColumn("");
//                   setFilterValue("");
//                 }
//               }}
//             >
//               Add Filter
//             </button>
//           </div>

//           {filters.length > 0 && (
//             <ul>
//               {filters.map((f, idx) => (
//                 <li key={idx}>
//                   {f.column} = {f.value || "(Empty)"}
//                   <button
//                     onClick={() => setFilters(filters.filter((_, i) => i !== idx))}
//                     style={{ marginLeft: "10px" }}
//                   >
//                     ❌
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           )}

//           <button onClick={handleFilter} style={{ marginTop: "1rem" }}>Apply Filters</button>
//         </div>
//       )}

//       {data.length > 0 && (
//         <div style={{ marginTop: "2rem" }}>
//           <button onClick={handleDownload} style={{ marginBottom: "1rem" }}>Download as Excel</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CalendarPage;

import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaCalendarAlt } from "react-icons/fa";
// import "./CalendarPage.css"; // Make sure this CSS file is created

const CustomInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
  <div
    onClick={onClick}
    ref={ref}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      border: "1px solid #ccc",
      borderRadius: "4px",
      padding: "8px 12px",
      width: "200px",
      cursor: "pointer",
      background: "#fff"
    }}
  >
    <span style={{ color: value ? "#000" : "#999" }}>{value || placeholder}</span>
    <FaCalendarAlt style={{ marginLeft: "8px", color: "#555" }} />
  </div>
));

const CalendarPage = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [filters, setFilters] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [filterOptions, setFilterOptions] = useState([]);

  
  const formatDate = (date) => {
    return date ? date.toLocaleDateString("en-GB").split("/").join("/") : "";
  };

  const handleFileUpload = async () => {
    if (!file) return alert("Please select a file.");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/upload", formData);
      alert(res.data.message);
      setData([]);
      setFilters([]);
      setStartDate(null);
      setEndDate(null);
      const colRes = await axios.get("http://localhost:5000/columns");
      setColumns(colRes.data.filter(c => c !== "id"));
      // setData([]);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed: " + (err.response?.data?.error || err.message));
    }
  };

  useEffect(() => {
    if (selectedColumn) {
      axios
        .get(`http://localhost:5000/column-values?column=${selectedColumn}`)
        .then(res => setFilterOptions(res.data))
        .catch(err => {
          console.error("Failed to fetch filter options:", err);
          setFilterOptions([]);
        });
    } else {
      setFilterOptions([]);
    }
  }, [selectedColumn]);

  const handleFilter = async () => {
    const query = {};
    filters.forEach(({ column, value }) => {
      query[column] = value;
    });
    if (startDate) query.from = startDate.toISOString().split("T")[0];
    // if (endDate) query.to = endDate.toISOString().split("T")[0];
    if (endDate) {
      const adjustedEnd = new Date(endDate);
      adjustedEnd.setDate(adjustedEnd.getDate() + 1); // Add 1 day to include the selected end date
      query.to = adjustedEnd.toISOString().split("T")[0];
    }

    try {
      const res = await axios.get("http://localhost:5000/transactions", { params: query });
      if (res.data.length === 0) {
        alert("Please select valid date");
      }
      setData([]);
      // setData(res.data);
      if (res.data.length === 0) {
        alert("⚠️ No data found for the selected filters. Please select a valid date range or filters.");
        setData([]); // Clear any previous data
      } else {
        setData(res.data);
      }
    } catch (err) {
      console.error("Filter failed:", err);
      alert("Filter failed");
    }
  };

  const handleDownload = () => {
    if (data.length === 0) return alert("No data to download");
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Data");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "filtered_data.xlsx");
  };

  return (
    // <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <div style={{ padding: "2rem", fontFamily: "Arial" }}>
        <style>{`
          .react-datepicker__day:hover {
            background-color: #f0f0f0;
            border-radius: 50%;
            transition: 0.2s;
          }
        `}</style>
      <h2>Upload Excel and Filter Transactions</h2>
      <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleFileUpload} style={{ marginLeft: "10px" }}>Upload</button>

      {columns.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h4>Filter by Column</h4>

          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label>From Date:</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="dd/MM/yy"
                placeholderText="Start Date"
                customInput={<CustomInput placeholder="Start Date" />}
                renderCustomHeader={({ date, decreaseMonth, increaseMonth, decreaseYear, increaseYear }) => (
                  <div style={{ display: "flex", justifyContent: "space-between", margin: 10 }}>
                    <div>
                      <button onClick={decreaseYear}>{"<<"}</button>
                      <button onClick={decreaseMonth}>{"<"}</button>
                    </div>
                    <span>{date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}</span>
                    <div>
                      <button onClick={increaseMonth}>{">"}</button>
                      <button onClick={increaseYear}>{">>"}</button>
                    </div>
                  </div>
                )}
              />
            </div>

            <div>
              <label>To Date:</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="dd/MM/yy"
                placeholderText="End Date"
                customInput={<CustomInput placeholder="End Date" />}
                minDate={startDate}
                renderCustomHeader={({ date, decreaseMonth, increaseMonth, decreaseYear, increaseYear }) => (
                  <div style={{ display: "flex", justifyContent: "space-between", margin: 10 }}>
                    <div>
                      <button onClick={decreaseYear}>{"<<"}</button>
                      <button onClick={decreaseMonth}>{"<"}</button>
                    </div>
                    <span>{date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}</span>
                    <div>
                      <button onClick={increaseMonth}>{">"}</button>
                      <button onClick={increaseYear}>{">>"}</button>
                    </div>
                  </div>
                )}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
            <select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)}>
              <option value="">Select Column</option>
              {columns.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>

            {selectedColumn && filterOptions.length > 0 && (
              <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)}>
                <option value="">Select Value</option>
                {filterOptions.map((val, idx) => (
                  <option key={idx} value={val}>{val}</option>
                ))}
              </select>
            )}

            <button
              onClick={() => {
                if (selectedColumn) {
                  setFilters(prev => [...prev, { column: selectedColumn, value: filterValue }]);
                  setSelectedColumn("");
                  setFilterValue("");
                }
              }}
            >
              Add Filter
            </button>
          </div>

          {filters.length > 0 && (
            <ul>
              {filters.map((f, idx) => (
                <li key={idx}>
                  {f.column} = {f.value || "(Empty)"}
                  <button
                    onClick={() => setFilters(filters.filter((_, i) => i !== idx))}
                    style={{ marginLeft: "10px" }}
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button onClick={handleFilter} style={{ marginTop: "1rem" }}>Apply Filters</button>
        </div>
      )}

      {data.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <button onClick={handleDownload} style={{ marginBottom: "1rem" }}>Download as Excel</button>
        </div>
      )}
    </div>
  );
};


export default CalendarPage;

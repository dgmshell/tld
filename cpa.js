document.getElementById('upload-cpa-3').addEventListener('click', function () {
    document.getElementById('file-input-3').click();
});

document.getElementById('file-input-3').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        Papa.parse(file, {
            header: false,
            skipEmptyLines: true,
            complete: function (results) {
                const rows = results.data;
                //const tableBody = document.getElementById('data-table').getElementsByTagName('tbody')[0];
                // tableBody.innerHTML = ''; // Limpiar la tabla existente

                const uniqueData = new Set();
                const domData = [];
                rows.forEach(function (cols, index) {
                    if (index === 0) return; // Ignorar la primera fila (encabezado)

                    cols.forEach(function (col, colIndex) {
                        //const cell = newRow.insertCell(colIndex);

                        if (colIndex === 2) {
                            const dateObj = new Date(col);
                            if (!isNaN(dateObj)) {
                                dateObj.setMinutes(0, 0, 0); // Redondear minutos

                                const year = dateObj.getFullYear();
                                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                                const day = String(dateObj.getDate()).padStart(2, '0');
                                const hours = String(dateObj.getHours()).padStart(2, '0');

                                const formattedDate = `${year}-${month}-${day} ${hours}:00:00`;
                                //cell.textContent = formattedDate;
                                uniqueData.add(formattedDate);

                                const setData = {
                                    LeadId: cols[0],
                                    DateCreated: cols[1],
                                    DateModified: formattedDate,
                                    Phone: cols[3],
                                    Vendor: cols[4],
                                    Touched: cols[5],
                                    ModifierName: cols[6],
                                    StatusDescription: cols[7]
                                };
                                domData.push(setData);
                            } else {
                                //cell.textContent = col; // Si no es una fecha válida
                            }
                        } else {
                            //cell.textContent = col;
                        }
                    });
                });


                // Guardar las fechas únicas y la data
                localStorage.setItem("unicos-cpa", JSON.stringify([...uniqueData]));
                localStorage.setItem("data-cpa", JSON.stringify(domData));

                // Recuperar las fechas únicas
                const storedDates = JSON.parse(localStorage.getItem("unicos-cpa")) || [];
                storedDates.sort();
                // Mostrar las fechas únicas ordenadas
                const uniqueTableBody = document.getElementById('unique-time-table-3').getElementsByTagName('tbody')[0];
                uniqueTableBody.innerHTML = ''; // Limpiar la tabla antes de agregar datos


                const countNewByDate = (storedDates, domData) => {
                    const dataByDate = domData.reduce((acc, item) => {
                        if (!acc[item.DateModified]) {
                            acc[item.DateModified] = { countConverted: 0, countAll: 0 };
                        }
                        acc[item.DateModified].countAll += 1;

                        if (item.StatusDescription === "Converted") {
                            acc[item.DateModified].countConverted += 1;
                        }
                        return acc;
                    }, {});


                    const result = storedDates.map(date => {
                        const { countConverted = 0, countAll = 0 } = dataByDate[date] || {};
                        return { date, countConverted, countAll };
                    });

                    localStorage.setItem("dataByDate", JSON.stringify(result));

                    return result;
                };


                const renderTableRows = (data, tableBody) => {
                    data.forEach(item => {
                        const row = document.createElement('tr');
                        if (item.date.includes("10:00:00") || item.date.includes("19:00:00")) {
                            row.classList.add("marked-row");
                        }
                        row.innerHTML = `
                            <td>${item.date}</td>
                     
                            <td>${item.countConverted}</td>
                            <td>${item.countAll}</td>
                            <td><button class="copy-clipboard">Copy</button></td>
                            `;

                        tableBody.appendChild(row);
                    });

                };
                const data = countNewByDate(storedDates, domData);
                renderTableRows(data, uniqueTableBody);

            },
            error: function () {
                alert('Error al analizar el archivo CSV');
            },
        });
    }
});

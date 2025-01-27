document.getElementById('upload-cpa').addEventListener('click', function () {
    document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', function (event) {
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

                    //const newRow = tableBody.insertRow();
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
                localStorage.setItem("unicos", JSON.stringify([...uniqueData]));
                localStorage.setItem("data", JSON.stringify(domData));

                // Recuperar las fechas únicas
                const storedDates = JSON.parse(localStorage.getItem("unicos")) || [];
                storedDates.sort();
                // Mostrar las fechas únicas ordenadas
                const uniqueTableBody = document.getElementById('unique-time-table').getElementsByTagName('tbody')[0];
                uniqueTableBody.innerHTML = ''; // Limpiar la tabla antes de agregar datos


                const countNewByDate = (storedDates, domData) => {
                    const dataByDate = domData.reduce((acc, item) => {
                        if (!acc[item.DateModified]) {
                            acc[item.DateModified] = { countConverted: 0, countNew: 0, countAll: 0 };
                        }
                        acc[item.DateModified].countAll += 1;
                        if (item.StatusDescription === "Converted") {
                            acc[item.DateModified].countConverted += 1;
                        } else if (item.StatusDescription === "New") {
                            acc[item.DateModified].countNew += 1;
                        }
                        return acc;
                    }, {});

                    let cumulativeConverted = 0;
                    let cumulativeNew = 0;
                    let cumulativeTotal = 0;

                    return storedDates.map(date => {
                        const { countConverted = 0, countNew = 0, countAll = 0 } = dataByDate[date] || {};
                        cumulativeConverted += countConverted;
                        cumulativeNew += countNew;
                        cumulativeTotal += countAll;
                        return { date, countConverted, countNew, countAll, cumulativeConverted, cumulativeNew, cumulativeTotal };
                    });
                };


                const renderTableRows = (data, tableBody) => {
                    // let totalConverted = 0;
                    // let totalNew = 0;
                    // let totalAll = 0;

                    data.forEach(item => {
                        const row = document.createElement('tr');
                        if (item.date.includes("10:00:00") || item.date.includes("19:00:00")) {
                            row.classList.add("marked-row");
                        }
                        row.innerHTML = `
                            <td>${item.date}</td>
                     
                            <td>${item.countConverted}</td>
                            <td>${item.countNew}</td>
                            <td>${item.countAll}</td>
                            <td>${item.cumulativeTotal}</td>
                            <td>${item.cumulativeTotal - item.cumulativeNew}</td>
                            <td>${item.cumulativeNew}</td>
                            <td>${item.cumulativeTotal}</td>
                            <td>${item.cumulativeConverted}</td>
                            <td><button class="copy-clipboard">Copy</button></td>
                            `;
                        tableBody.appendChild(row);
                        //
                        // totalConverted += item.countConverted;
                        // totalNew += item.countNew;
                        // totalAll += item.countAll;
                        //
                        // console.log(totalConverted)
                    });

                    // const totalRow = document.createElement('tr');
                    // totalRow.style.fontWeight = 'bold';
                    // totalRow.innerHTML = `
                    //          <td>Total</td>
                    //          <td>${totalConverted}</td>
                    //          <td>${totalNew}</td>
                    //          <td>${totalAll}</td>
                    //          `;
                    // tableBody.appendChild(totalRow);
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

document.getElementById('upload-buffer-4').addEventListener('click', () => {
    document.getElementById('file-input-4').click();
});

document.getElementById('file-input-4').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => processCSVData(results.data),
        error: () => alert('Error al analizar el archivo CSV'),
    });
});

function processCSVData(rows) {
    const uniqueData = new Set();
    const domData = [];

    rows.forEach((cols, index) => {
        if (index === 0) return; // Saltar encabezado

        const formattedDate = formatDate(cols[2]);
        if (formattedDate) {
            uniqueData.add(formattedDate);

            domData.push({
                LeadId: cols[0],
                DateCreated: cols[1],
                DateModified: formattedDate,
                Phone: cols[3],
                Vendor: cols[4],
                Touched: cols[5],
                ModifierName: cols[6],
                StatusDescription: cols[7],
            });
        }
    });

    // Guardar en LocalStorage
    localStorage.setItem("unicos", JSON.stringify([...uniqueData]));
    localStorage.setItem("data", JSON.stringify(domData));

    // Procesar y renderizar datos
    const storedDates = [...uniqueData].sort();
    const summaryData = summarizeData(storedDates, domData);
    renderTableRows(summaryData, 'unique-time-table-4', storedDates);
}

function formatDate(dateString) {
    const dateObj = new Date(dateString);
    if (isNaN(dateObj)) return null;

    dateObj.setMinutes(0, 0, 0); // Redondear a la hora exacta
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:00:00`;
}

function summarizeData(storedDates, domData) {
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

    return storedDates.map(date => {
        const { countConverted = 0, countAll = 0 } = dataByDate[date] || {};
        return { date, countConverted, countAll };
    });
}

function renderTableRows(data, tableId, storedDates) {
    const tableBody = document.getElementById(tableId).getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Limpiar la tabla existente

    const dataByDate1 = JSON.parse(localStorage.getItem("dataByDate")) || [];
    const dataByDate2 = summarizeData(storedDates, JSON.parse(localStorage.getItem("data")) || []);
    console.log(dataByDate2)
    const mapDataByDate2 = new Map(dataByDate2.map(item => [item.date, item.countConverted]));
    const mapDataByDate1 = new Map(dataByDate2.map(item => [item.date, item.countAll]));
    const mapDataByDate3 = new Map(dataByDate2.map(item => [item.date, item.countAll]));
    const resultFull = dataByDate1.map(item => ({
        date2: item.date,
        countConverted2: (mapDataByDate2.get(item.date) || 0) + item.countConverted,
        countAll2: item.countAll,
    }));

    const BillableCalls  = dataByDate1.map(item => ({
        date: item.date,
        totalBillable: (mapDataByDate1.get(item.date) || 0) + item.countConverted,
        countAll: item.countAll,
    }));
    const CostTotalDeals  = dataByDate1.map(item => ({
        date: item.date,
        CostTotal: (mapDataByDate3.get(item.date) || 0)*25 + item.countConverted *80
    }));
    let CumulativeBillableTotal=0;
    let CumulativeDealClosed=0;
    let CumulativeCostTotal=0;
    data.forEach(item => {
        const BillableCallsTotal = BillableCalls.find(result => result.date === item.date);
        const matchingResult = resultFull.find(result => result.date2 === item.date);
        const CostTotal = CostTotalDeals.find(result => result.date === item.date);


        CumulativeBillableTotal += BillableCallsTotal.totalBillable;
        CumulativeDealClosed += matchingResult.countConverted2;
        CumulativeCostTotal += CostTotal.CostTotal;
        const row = document.createElement('tr');

        if (item.date.includes("10:00:00") || item.date.includes("19:00:00")) {
            row.classList.add("marked-row");
        }

        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.countConverted}</td>
            <td>${item.countAll}</td>
            <td>${BillableCallsTotal ? BillableCallsTotal.totalBillable : 0}</td>
            <td>${matchingResult ? matchingResult.countConverted2 : 0}</td>
            <td>${CostTotal ? CostTotal.CostTotal : 0}</td>
            <td>${CumulativeBillableTotal}</td>
            <td>${CumulativeDealClosed}</td>
            <td>${CumulativeCostTotal}</td>
            <td><button class="copy-clipboard">Copy</button></td>
        `;
        tableBody.appendChild(row);
    });
}

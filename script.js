document.addEventListener('DOMContentLoaded', function () {
    // Function to read data from Excel file
    function readExcelFile(file, callback) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            callback(jsonData);
        };
        reader.readAsArrayBuffer(file);
    }

    // Function to handle file input change
    function handleFileInputChange(event) {
        const file = event.target.files[0];
        if (file) {
            readExcelFile(file, function (data) {
                // Use the data from Excel for creating tables and charts
                const brokersData = data; // Assuming data is in the required format
                createBrokersTable(brokersData);
                createGWPChart(brokersData);
                // createBusinessClassChart(businessClassData); // Uncomment if business class data is available
            });
        }
    }

    // Attach event listener to file input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileInputChange);
    }

    // Function to create the broker performance table
    function createBrokersTable(data) {
        // Sort the data by GWP in descending order
        data.sort((a, b) => b[2] - a[2]); // Assuming GWP is in the third column (index 2)

        // Take only the top 10 brokers
        const topBrokers = data.slice(1, 11); // Exclude the header row and take the first 10 rows

        // Assuming the table container has the id "brokersTable"
        const tableContainer = document.getElementById('brokersTable');

        // Create the table element
        const table = document.createElement('table');
        table.className = 'broker-table';

        // Create the table header
        const headerRow = document.createElement('tr');
        const headers = ['Year', 'Broker Name', 'GWP', 'Planned GWP', 'Market Type', 'Difference (%)'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // Create table rows with data for top brokers
        topBrokers.forEach(rowData => {
            const row = document.createElement('tr');
            // Assuming the columns are in the order: Year, Broker Name, GWP, Planned GWP, Market Type
            const [year, brokerName, gwp, plannedGWP, marketType] = rowData;
            const differencePercentage = ((gwp - plannedGWP) / plannedGWP) * 100;

            // Add data to table cells
            [year, brokerName, gwp, plannedGWP, marketType, differencePercentage.toFixed(2)].forEach(cellData => {
                const cell = document.createElement('td');
                cell.textContent = cellData;
                row.appendChild(cell);
            });

            // Append the row to the table
            table.appendChild(row);
        });

        // Clear previous content and append the table to the container
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
    }

    // Function to create the GWP chart
    function createGWPChart(data) {
        // Sort the data by GWP in descending order
        data.sort((a, b) => b[2] - a[2]); // Assuming GWP is in the third column (index 2)

        // Take only the top 10 brokers
        const topBrokers = data.slice(1, 11); // Exclude the header row and take the first 10 rows

        // Extract GWP and Planned GWP data for the top 10 brokers
        const labels = topBrokers.map(row => row[1]); // Broker Names
        const gwpData = topBrokers.map(row => row[2]); // GWP values
        const plannedGWPData = topBrokers.map(row => row[3]); // Planned GWP values

        // Create a chart
        const ctx = document.getElementById('gwpChart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'GWP',
                        data: gwpData,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Planned GWP',
                        data: plannedGWPData,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Function to create the Business Class chart
    function createBusinessClassChart(data) {
        // Sort the data by GWP in descending order
        data.sort((a, b) => b[2] - a[2]); // Assuming GWP is in the third column (index 2)

        // Take only the top 10 brokers
        const topBrokers = data.slice(1, 11); // Exclude the header row and take the first 10 rows

        // Extract business class data for the top 10 brokers
        const labels = ['Class A', 'Class B', 'Class C', 'Class D', 'Class E']; // Example business class names
        const datasets = topBrokers.map(row => {
            // Example business class data for each broker, replace with actual data
            return {
                label: row[1], // Broker Name
                data: [randomValue(), randomValue(), randomValue(), randomValue(), randomValue()], // Example data for each business class
                backgroundColor: getRandomColor(),
                borderColor: getRandomColor(),
                borderWidth: 1
            };
        });

        // Create a chart
        const ctx = document.getElementById('businessClassChart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Function to generate a random value for business class data
    function randomValue() {
        return Math.floor(Math.random() * 100) + 1; // Generate a random value between 1 and 100
    }

    // Function to generate a random color for chart datasets
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Function to send user query to backend and display response
    function sendQueryToBackend(query) {
        fetch('/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: query })
        })
            .then(response => response.json())
            .then(data => {
                displayBotResponse(data.response);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    // Function to display chatbot response in the chat window
    function displayBotResponse(response) {
        const chatMessages = document.getElementById('chatMessages');
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message');
        messageElement.textContent = response;
        chatMessages.appendChild(messageElement);
    }

    // Add event listener to the chat input field
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const query = chatInput.value.trim();
                if (query !== '') {
                    // Send the user query to the backend
                    sendQueryToBackend(query);
                    // Clear the input field
                    chatInput.value = '';
                }
            }
        });
    }



});

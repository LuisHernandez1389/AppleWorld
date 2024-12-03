    // Configuración común para los gráficos
    const chartConfig = {
        type: 'line',
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      };
      
      // Función para generar datos aleatorios
      function generateRandomData(count, min = 100, max = 1000) {
        return Array.from({length: count}, () => Math.floor(Math.random() * (max - min) + min));
      }
      
      // Función para formatear números como moneda
      function formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
      }
      
      // Función para obtener etiquetas según el período
      function getLabels(period) {
        switch(period) {
          case 'week':
            return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
          case 'month':
            return Array.from({length: 31}, (_, i) => `${i + 1}`);
          case 'year':
            return ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          default:
            return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        }
      }
      
      // Función para actualizar un gráfico
      function updateChart(chartId, period, color) {
        const chart = Chart.getChart(chartId);
        if (chart) {
          chart.destroy();
        }
      
        const labels = getLabels(period);
        const data = generateRandomData(labels.length);
        
        // Calcular totales y promedios
        const total = data.reduce((a, b) => a + b, 0);
        const average = total / data.length;
        
        // Actualizar métricas
        const totalId = chartId.replace('Chart', 'Total');
        const averageId = chartId.replace('Chart', 'Average');
        
        const totalElement = document.getElementById(totalId);
        const averageElement = document.getElementById(averageId);
        
        if (totalElement) totalElement.textContent = formatCurrency(total);
        if (averageElement) averageElement.textContent = formatCurrency(average);
      
        new Chart(document.getElementById(chartId), {
          ...chartConfig,
          data: {
            labels,
            datasets: [{
              data: data,
              borderColor: color,
              tension: 0.4,
              fill: false
            }]
          }
        });
      }
      
      // Inicializar todos los gráficos con sus respectivos colores
      document.addEventListener('DOMContentLoaded', () => {
        updateChart('expensesChart', 'week', '#1976D2');
        updateChart('salesChart', 'week', '#FF5722');
        updateChart('inventoryChart', 'week', '#4CAF50');
        
        // Event listeners para los filtros de fecha
        document.getElementById('expensePeriod').addEventListener('change', (e) => {
          updateChart('expensesChart', e.target.value, '#1976D2');
        });
        
        document.getElementById('salesPeriod').addEventListener('change', (e) => {
          updateChart('salesChart', e.target.value, '#FF5722');
        });
        
        document.getElementById('inventoryPeriod').addEventListener('change', (e) => {
          updateChart('inventoryChart', e.target.value, '#4CAF50');
        });
      });
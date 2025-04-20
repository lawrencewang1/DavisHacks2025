document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('histogramChart').getContext('2d');
    
    const bins = ['50k-60k', '60k-70k', '70k-80k', '80k-90k', '90k-100k', '100k-110k', '110k-120k', '120k-130k', '130k-140k'];
    const counts = [2, 6, 15, 13, 10, 6, 1, 0, 5];
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: bins,
        datasets: [{
          label: 'Count',
          data: counts,
          backgroundColor: 'rgba(250, 250, 138, 0.6)',
          borderColor: 'rgb(235, 192, 104)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            enabled: true
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Test Calculated Value'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Count'
            },
            beginAtZero: true
          }
        }
      }
    });
  });
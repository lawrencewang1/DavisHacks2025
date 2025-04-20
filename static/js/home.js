document.addEventListener('DOMContentLoaded', function() {
  // Chart.js implementation
  const ctx = document.getElementById('dataChart').getContext('2d');
  
  // Default chart configuration (histogram)
  let chartConfig = {
    type: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{
        label: 'School Performance Distribution',
        data: [65, 78, 90, 82],
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: 'rgba(255, 255, 255, 0.9)'
          }
        }
      }
    }
  };
  
  let myChart = new Chart(ctx, chartConfig);
  
  // Chart button functionality
  const chartButtons = document.querySelectorAll('.chart-btn');
  
  chartButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      chartButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Update chart based on button data-chart attribute
      const chartType = this.getAttribute('data-chart');
      updateChart(chartType);
    });
  });
  
  function updateChart(chartType) {
    // Destroy previous chart
    myChart.destroy();
    
    // Create new chart configuration based on type
    if (chartType === 'histogram') {
      chartConfig.type = 'bar';
      chartConfig.data.labels = ['Q1', 'Q2', 'Q3', 'Q4'];
      chartConfig.data.datasets = [{
        label: 'School Performance Distribution',
        data: [65, 78, 90, 82],
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 1
      }];
    } else if (chartType === 'line') {
      chartConfig.type = 'line';
      chartConfig.data.labels = ['2020', '2021', '2022', '2023', '2024'];
      chartConfig.data.datasets = [{
        label: 'Performance Trends',
        data: [50, 60, 75, 85, 92],
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderColor: 'rgba(255, 255, 255, 0.8)',
        tension: 0.4,
        fill: true
      }];
    } else if (chartType === 'radar') {
      chartConfig.type = 'radar';
      chartConfig.data.labels = ['Math', 'Science', 'Reading', 'Writing', 'History'];
      chartConfig.data.datasets = [{
        label: 'School A',
        data: [85, 90, 70, 75, 80],
        backgroundColor: 'rgba(142, 202, 230, 0.5)',
        borderColor: 'rgba(142, 202, 230, 1)',
        borderWidth: 2
      }, {
        label: 'School B',
        data: [65, 80, 85, 70, 90],
        backgroundColor: 'rgba(255, 183, 3, 0.5)',
        borderColor: 'rgba(255, 183, 3, 1)',
        borderWidth: 2
      }];
    }
    
    // Create new chart
    myChart = new Chart(ctx, chartConfig);
  }
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Smooth scroll to target
        window.scrollTo({
          top: targetElement.offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Navbar background change on scroll
  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
  
  // Mission section animation on scroll
  const missionContent = document.querySelector('.mission-content');
  
  // Intersection Observer for mission section
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.2
  });
  
  // Observe mission content
  observer.observe(missionContent);
});

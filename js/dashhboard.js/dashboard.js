const ctx = document.getElementById('patientChart');

new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets: [{
      label: 'Patients',
      data: [12, 19, 14, 22, 18, 10, 25],
      borderRadius:6
    }]
  },
  options: {
    plugins:{
      legend:{ display:false }
    },
    scales:{
      y:{
        beginAtZero:true,
        grid:{ display:false }
      },
      x:{
        grid:{ display:false }
      }
    }
  }
});
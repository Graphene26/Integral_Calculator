window.onload = function() {
    // Variabel
    const resultRct = document.querySelector('.result-rect');
    const resultTrp = document.querySelector('.result-trap');
    const chartMsg = document.querySelector('.chart-info');
    const results = document.querySelector('.results');
  
    const cbInput = document.querySelector('.input-cb');
    const rangeInputFrom = document.querySelector('.input-range-from');
    const rangeInputTo = document.querySelector('.input-range-to');
    const stepInput = document.querySelector('.input-step');
  
    const btn = document.querySelector('.btn');
    
    let isChartCreated = false;
    
    // Variabel Chart
    let canvas = document.getElementById('myChart');
    let ctx = canvas.getContext('2d');
    
    
    let chartData = [];
    let myLabels = [];
  
    // Fungsi
  
    const createChart = inp => {
      const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                type: 'line',
                label: `f(x) = ${inp.value}`,
                backgroundColor: 'transparent',
                borderColor: '#ff7400',
                data: []
            }, {
                label: 'Aturan Persegi',
                borderColor: changeBarChartColor().barBorderColors,
                borderWidth: '2',
                backgroundColor: changeBarChartColor().barColors,
                data: []
                          
            }]
        },
        options: {
          scales: {
            xAxes: [{
                barPercentage: 1,
                categoryPercentage: 1,  
            }],
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          },
          legend: {
              labels: {
                  generateLabels: function(chart) {
                  labels = Chart.defaults.global.legend.labels.generateLabels(chart);
                  // let gradient = ctx.createLinearGradient(0, 0, 170, 0);
                  // gradient.addColorStop(0, '#1ebbd7');
                  // gradient.addColorStop(1, '#ff5252');
  
                  labels[1].fillStyle = '#1ebbd7';
                  return labels;
                }
              }
          }
        }
      });
      
      return myChart;
    };
  
    const addChartData = (chart, labelArr, data) => {
      chart.data.labels = labelArr;
      chart.data.datasets.forEach(dataset => dataset.data = data);
      chart.update();
    };
  
    const removeChartData = () => {
      myLabels = [];
      chartData = [];
    };
  
    const changeBarChartColor = () => {
      // warna persegi yang berbeda untuk nilai positif dan negatif
      const barColors = chartData.map(item => item.y > 0 ? '#1ebbd7' : "#ff5252");
      const barBorderColors = chartData.map(item => item.y > 0 ? '#189ad3' : "#ff0000");
      return {
        barColors,
        barBorderColors
      }
    };
  
    const roundResult = result => math.round(result, 3);
  
    const integrateRct = (fn, step, start, end) => {
      // hapus data chart
      removeChartData();    
  
      let sumRct = 0;
      for (let i = start; i <= end; i += step) {
        if (fn(i) == Infinity || -Infinity) {
          i = i + step / 100;
        }
        if (i <= end - step) sumRct = math.add(sumRct, math.multiply(fn(i), step));
  
        // update data chart 
        chartData.push({
          x: i,
          y: roundResult(fn(i))
        });
  
        myLabels.push(i.toFixed(step.toString().replace('.', '').length - 1));
      }
  
      // hapus data chart jika terdapat angka kompleks
      if (typeof sumRct !== 'number') {
        removeChartData();
        hideCanvas();
        chartMsg.classList.remove('is-hidden');
      } else {
        chartMsg.classList.add('is-hidden');
      }
      
  
      return `Aturan Persegi: ${roundResult(sumRct)}`
    }
  
    const integrateTrp = (fn, step, start, end) => {
      let sumTrp = 0;
      for (let i = start; i <= end; i += step) {
        if (fn(i) == Infinity || -Infinity || 
            fn(i + step) == Infinity || -Infinity) {
          i = i + step / 100;
        }      
        if (i <= end - step) {
          sumTrp = math.add(sumTrp, math.multiply(math.add(fn(i), fn(i + step)), step, 0.5));
        }
      }
      
      return `Aturan Trapesium: ${roundResult(sumTrp)}`
    }
  
    // fungsi tambahan karena library math.js
    const getInpFunc = inp => {
      const parser = math.parser();
      parser.evaluate(`f(x) = ${inp.value}`);
      return parser.get('f'); 
    };
  
  
    btn.addEventListener('click', () => {
      const errorMessage = document.querySelector('.error-message');
      errorMessage.classList.add('is-hidden');
      results.classList.add('is-hidden');
      cbInput.classList.remove('on-error');
      rangeInputFrom.classList.remove('on-error');
      rangeInputTo.classList.remove('on-error');
      stepInput.classList.remove('on-error');
      
      try {
        if (isChartCreated) {
          resetCanvas();
        };
        
        errorMessage.innerHTML = '';
        
        if (+rangeInputFrom.value > +rangeInputTo.value) {
            throw new Error('Rentang tidak valid');
        } else if (+stepInput.value > +rangeInputTo.value - +rangeInputFrom.value &&
                   rangeInputTo.value &&
                   rangeInputFrom.value) {
            throw new Error('Langkah tidak valid');
        }
  
        const argsArray = [getInpFunc(cbInput), 
          Number(stepInput.value), 
          Number(rangeInputFrom.value), 
          Number(rangeInputTo.value)
        ];   
        
        resultRct.innerHTML = integrateRct(...argsArray);
  
        resultTrp.innerHTML = integrateTrp(...argsArray);
        
        results.classList.remove('is-hidden');
        
        changeBarChartColor();
  
        addChartData(createChart(cbInput), myLabels, chartData); 
        isChartCreated = true;
      } catch(err) {
        
        errorMessage.classList.remove('is-hidden');
        
        switch(true) {
          case err.message == 'Unexpected end of expression (char 8)' || err.message == 'Value expected (char 8)':
            errorMessage.innerHTML = 'Anda harus memasukkan fungsi integral!';
            cbInput.classList.add('on-error');
            break;
          case err.message.startsWith('Undefined symbol') || err.message.startsWith('Unexpected type of argument'):
            errorMessage.innerHTML = 'Fungsi integral tidak valid!';
            cbInput.classList.add('on-error');
            break;
          case err.message == 'Rentang tidak valid':
            errorMessage.innerHTML = `Rentang "ke" harus lebih besar daripada rentang "dari"!`;
            rangeInputFrom.classList.add('on-error');
            rangeInputTo.classList.add('on-error');
            break;
          case err.message.includes(','):
            errorMessage.innerHTML = `Gunakan '.' sebagai pemisah desimal!`;
            cbInput.classList.add('on-error');
            break;
          case err.message == 'Langkah tidak valid':
            errorMessage.innerHTML = 'Langkah tidak boleh lebih besar dari rentang!';
            stepInput.classList.add('on-error');
            break;
          default:
            errorMessage.innerHTML = err.message;
            cbInput.classList.add('on-error');
            break;
        }
        console.log(err.message)
      }
       
    });
  
    function resetCanvas() {
      let oldEl = document.querySelector('#myChart');
      oldEl.parentNode.removeChild(oldEl);
      let newEl = document.createElement('canvas');
      newEl.setAttribute('id', 'myChart');
      document.querySelector('.chart-container').appendChild(newEl);
      canvas = document.querySelector('#myChart');
      ctx = canvas.getContext('2d');
    };
    
    function hideCanvas() {
      let canvas = document.querySelector('#myChart');
      canvas.style.display = "none";
    }  
    
  };
  
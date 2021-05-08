var crimeDonutChartData, state = ["NY"], year_list = ['2014', '2015', '2016', '2017', '2018', '2019']

async function getDonutChartData(state, year_list) {
  const url = "http://localhost:5000/getCrimeDonutChart"

  var response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ state: state, year_list: year_list })
  })
  var response_json = await response.json()
  console.log("function called")
  crimeDonutChartData = response_json['data']
  state_list = response_json['state']
  year_list = response_json['year_list']
  console.log(crimeDonutChartData)
}

$(document).ready(function () {
  getDonutChartData(state_list, year_list)
})
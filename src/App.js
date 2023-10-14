import { useEffect, useState } from 'react';
import axios from 'axios'
import ReactApexChart from 'react-apexcharts';
import './App.css';

function App() {
  const [activeDiv, setActiveDiv] = useState(1);
  const [userData, setUserData] = useState([]);
  const [grandTotal, setGrandTotal] = useState([]);
  const [grandTotalofDis, setGrandTotalOddis] = useState([]);
  const [campaignData, setCampaignData] = useState([]);
  const [secchartData, setsecChartData] = useState([]);
  const [campaignNamessecChart, setCampaignNamessecChart] = useState([]);
  const [dates, setDates] = useState([])
  const [selectedDate, setSelectedDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUserData, setFilteredUserData] = useState(userData);
  const [searchText, setSearchText] = useState(''); 
  const [filteredData, setFilteredData] = useState(userData);

  const handleSearchFirst = (event) => {
    const query = event.target.value;
    setSearchText(query);

    const filteredUserData = query
      ? userData.filter((user) =>
        user.userFullName.toLowerCase().includes(query.toLowerCase())
      )
      : userData;

    setFilteredData(filteredUserData);
  };


  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    const filteredData = query
      ? userData.filter((user) =>
        user.userFullName.toLowerCase().includes(query.toLowerCase())
      )
      : userData;
    setFilteredUserData(filteredData);
  };

  const showDiv = (divNumber) => {
    setActiveDiv(divNumber);
  };
  useEffect(() => {
    axios.get('http://localhost:7000/api/unique-dates')
      .then((res) => {
        setDates(res.data);
      })
      .catch((error) => {
        console.log(error)
      })
  }, [])

  useEffect(() => {
    axios
      .get(`http://localhost:7000/api/sum-campaign-count-by-callType?date=${selectedDate}`)
      .then((response) => {
        setsecChartData(response.data);
        if (response.data.length > 0) {
          setCampaignNamessecChart(response.data[0]);
        }
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, [selectedDate]);

  const callTypes = secchartData.map((item) => item.callType);
  // const campaignCounts = secchartData.map((item) => item.campaignCount);
  const campaignDatas = secchartData
    .slice(0, 1)
    .reduce((acc, item) => {
      for (const campaign in item) {
        if (campaign !== 'callType' && campaign !== 'campaignCount') {
          acc[campaign] = secchartData.map((item) => item[campaign]);
        }
      }
      return acc;
    }, {});

  const chartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      stacked: false,
      toolbar: {
        show: true,
        tools: {
          download: true,
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '80%',
      },
    },
    xaxis: {
      categories: callTypes,
      labels: {
        show: true,
        style: {
          colors: '#000',
        },
      },
    },
  };

  const series = Object.keys(campaignDatas).map((campaign) => ({
    name: campaign,
    data: campaignDatas[campaign],
  }));

  useEffect(() => {
    axios.get(`http://localhost:7000/api/sum-totals-by-campaign?date=${selectedDate}`)
      .then((response) => {
        setCampaignData(response.data);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, [selectedDate]);

  useEffect(() => {
    fetch(`http://localhost:7000/api/sum-users?date=${selectedDate}`)
      .then((response) => response.json())
      .then((data) => setUserData(data))
      .catch((error) => console.error('Error fetching data:', error));

    async function TotalData() {
      const Gdata = await axios.get(`http://localhost:7000/api/sum-totals-by-callstatus?date=${selectedDate}`);
      if (Gdata) {
        setGrandTotal(Gdata.data || null)
        setGrandTotalOddis(Gdata.data[0].callStatusCount || null)
      }
    }
    TotalData();
  }, [selectedDate]);

  const campaignNames = campaignData.map((item) => item.campaign);
  const connectedCounts = campaignData.map((item) => item.callStatusCounts.CONNECTED);
  const disconnectedCounts = campaignData.map((item) => item.callStatusCounts.DISCONNECTED);

  const chartData = {
    options: {
      chart: {
        type: 'bar',
      },
      xaxis: {
        categories: campaignNames,
      },
    },
    series: [
      {
        name: 'CONNECTED',
        data: connectedCounts,
      },
      {
        name: 'DISCONNECTED',
        data: disconnectedCounts,
      },
    ],
  };
  function parseTime(timeString) {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }


  // Function to format time values back to time strings
  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  const columnTotals = {}; // Initialize an object to store column totals
  const columnsToDisplay = Object.keys(campaignNamessecChart)
    .filter((campaign) => campaign !== 'callType' && campaign !== 'campaignCount');


  return (
    <>
      <div className='App m-2 border rounded'>
        <div className='d-flex flex-wrap justify-content-between'>
          <div className=' ms-4 mt-2 ps-2 pe-2 pt-2 bg-primary text-light border rounded'>
            <h4>MIT-SDE</h4>
            <small className='font-italic'>Cdr_Report</small>

          </div>
          <div>
            <button className='btn btn-outline-primary m-1' onClick={() => showDiv(1)}>Over All</button>
            <button className='btn btn-outline-primary m-1' onClick={() => showDiv(2)}>Connected Calls</button>
            <button className='btn btn-outline-primary m-1' onClick={() => showDiv(3)}>Chars</button>
            <select
              className='btn btn-outline-primary ms-3 dropdown-toggle'
              id="dateSelect"
              value={setSelectedDate || ''}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              <option value="">Select a Date</option>
              {dates.map((date) => (
                <>
                  <option key={date} value={date}>
                    {date}
                  </option>
                </>
              ))}
              <option value={''}>All</option>
            </select>
          </div>
          <div>

          </div>
        </div>

        <div className="App" style={{ display: activeDiv === 1 ? 'block' : 'none' }}>
          <div className='container'>
            <div className='d-flex justify-content-around'>
            <h5>Over All</h5>
            <input
              type="text"
              placeholder="Search by User Name"
              value={searchText}
              onChange={handleSearchFirst}
            />
            </div>
           
            <table className='table table-bordered'>
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Connected Calls</th>
                  <th>Sum Talk Duration</th>
                  <th>Disconnected Calls</th>
                  <th>SUM Talk Duration</th>
                  <th>Total Count Of Call Status</th>
                  <th>Total Sum Of Talk Duration</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((user, index) => (
                    <tr key={index}>
                      <td>{user.userFullName || null}</td>
                      <td style={{ backgroundColor: "#b5ffc4" }}>{user.callStatusCounts.CONNECTED || null}</td>
                      <td>{user.talkDurationSum}</td>
                      <td style={{ backgroundColor: "#ffb5b9" }}>{user.callStatusCounts.DISCONNECTED || null}</td>
                      <th>0</th>
                      <th>{user.callStatusCounts.CONNECTED + user.callStatusCounts.DISCONNECTED || null}</th>
                      <td>{user.talkDurationSum || null}</td>
                    </tr>
                  ))
                ) : (
                  userData.map((user, index) => (
                    <tr key={index}>
                      <td>{user.userFullName || null}</td>
                      <td style={{ backgroundColor: "#b5ffc4" }}>{user.callStatusCounts.CONNECTED || null}</td>
                      <td>{user.talkDurationSum}</td>
                      <td style={{ backgroundColor: "#ffb5b9" }}>{user.callStatusCounts.DISCONNECTED || null}</td>
                      <th>0</th>
                      <th>{user.callStatusCounts.CONNECTED + user.callStatusCounts.DISCONNECTED || null}</th>
                      <td>{user.talkDurationSum || null}</td>
                    </tr>
                  ))
                )}

                {grandTotal.length > 1 && grandTotal.slice(0, 1).map(() => (
                  <tr>
                    <td><strong>{grandTotal[1].callStatus || null}</strong></td>
                    <td><strong>{grandTotal[1].callStatusCount || null}</strong></td>
                    <td><strong>{grandTotal[1].talkDurationSum || null}</strong></td>
                    <td><strong>{grandTotalofDis || null}</strong></td>
                    <td><strong>0</strong></td>
                    <td><strong>{grandTotalofDis + grandTotal[1].callStatusCount || null}</strong></td>
                    <td><strong>{grandTotal[1].talkDurationSum || null}</strong></td>
                  </tr>
                ))}

                {/* {userData.map((user, index) => (
                  <tr key={index}>
                    <td>{user.userFullName || null}</td>
                    <td style={{ backgroundColor: "#b5ffc4" }}>{user.callStatusCounts.CONNECTED || null}</td>
                    <td>{user.talkDurationSum}</td>
                    <td style={{ backgroundColor: "#ffb5b9" }}>{user.callStatusCounts.DISCONNECTED || null}</td>
                    <th>0</th>

                    <th>{user.callStatusCounts.CONNECTED + user.callStatusCounts.DISCONNECTED || null}</th>
                    <td>{user.talkDurationSum || null}</td>
                  </tr>
                ))}
                {grandTotal.length > 1 && grandTotal.slice(0, 1).map(() => (
                  <tr>
                    <td><strong>{grandTotal[1].callStatus || null}</strong></td>
                    <td><strong>{grandTotal[1].callStatusCount || null}</strong></td>
                    <td><strong>{grandTotal[1].talkDurationSum || null}</strong></td>
                    <td><strong>{grandTotalofDis || null}</strong></td>
                    <td><strong>0</strong></td>
                    <td><strong>{grandTotalofDis + grandTotal[1].callStatusCount || null}</strong></td>
                    <td><strong>{grandTotal[1].talkDurationSum || null}</strong></td>

                  </tr>
                ))} */}
              </tbody>
            </table>
          </div>
        </div>
        <div className="App" style={{ display: activeDiv === 2 ? 'block' : 'none' }}>
          <div className='container'>
          <div className='d-flex justify-content-around'>
          <h5>Connected Calls</h5>
            <input
              type="text"
              placeholder="Search by User Name"
              value={searchQuery}
              onChange={handleSearch}
            />

          </div>
           
            <table className='table table-bordered'>
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Connected Calls</th>
                  <th>Total Talk Duration</th>
                  <th>Average Talk Duration</th>
                  <th>Disconnected Calls</th>
                </tr>
              </thead>
              <tbody>
                {/* <tbody> */}
                {filteredUserData.length > 0 ? (
                  filteredUserData.map((user, index) => (
                    <tr key={index}>
                      <td>{user.userFullName}</td>
                      <td style={{ backgroundColor: "#b5ffc4" }}>{user.callStatusCounts.CONNECTED}</td>
                      <td>{user.talkDurationSum}</td>
                      <td>{user.talkDurationAvg}</td>
                      <td style={{ backgroundColor: "#ffb5b9" }}>{user.callStatusCounts.DISCONNECTED}</td>
                    </tr>
                  ))
                ) : (
                  userData.map((user, index) => (
                    <tr key={index}>
                      <td>{user.userFullName}</td>
                      <td style={{ backgroundColor: "#b5ffc4" }}>{user.callStatusCounts.CONNECTED}</td>
                      <td>{user.talkDurationSum}</td>
                      <td>{user.talkDurationAvg}</td>
                      <td style={{ backgroundColor: "#ffb5b9" }}>{user.callStatusCounts.DISCONNECTED}</td>
                    </tr>
                  ))
                )}
                {grandTotal.length > 1 && grandTotal.slice(0, 1).map(() => (
                  <tr>
                    <td><strong>{grandTotal[1].callStatus || null}</strong></td>
                    <td><strong>{grandTotal[1].callStatusCount}</strong></td>
                    <td><strong>{grandTotal[1].talkDurationSum}</strong></td>
                    <td><strong>{grandTotal[1].talkDurationAvg}</strong></td>
                    <td><strong>{grandTotalofDis}</strong></td>
                  </tr>
                ))}
              </tbody>

              {/* {filteredUserData.map((user, index) => (
                  <tr key={index}>
                    <td>{user.userFullName}</td>
                    <td style={{ backgroundColor: "#b5ffc4" }}>{user.callStatusCounts.CONNECTED}</td>
                    <td>{user.talkDurationSum}</td>
                    <td>{user.talkDurationAvg}</td>
                    <td style={{ backgroundColor: "#ffb5b9" }}>{user.callStatusCounts.DISCONNECTED}</td>
                  </tr>
                ))}
                {grandTotal.length > 1 && grandTotal.slice(0, 1).map(() => (
                  <tr>
                    <td><strong>{grandTotal[1].callStatus || null}</strong></td>
                    <td><strong>{grandTotal[1].callStatusCount}</strong></td>
                    <td><strong>{grandTotal[1].talkDurationSum}</strong></td>
                    <td><strong>{grandTotal[1].talkDurationAvg}</strong></td>
                    <td><strong>{grandTotalofDis}</strong></td>
                  </tr>
                ))}
              </tbody> */}
            </table>
          </div>
        </div>
        <div className="App" style={{ display: activeDiv === 3 ? 'block' : 'none' }}>
          <div className='container'>
            <h2>Charts</h2>
            <div className='row'>
              <div className='col-sm-6'>
                <h4><strong>Team Wise Call Status</strong></h4>
                <ReactApexChart options={chartData.options} series={chartData.series} type="bar" height={350} />
                <div className="table-responsive">
                  <table className="table table-striped table-bordered">
                    <thead>
                      <tr>
                        <th>Campaign</th>
                        <th>Connected</th>
                        <th>Disconnected</th>
                        <th>Talk Duration Sum</th>
                        <th>Talk Duration Avg</th>
                      </tr>

                    </thead>
                    <tbody>
                      {campaignData.map((item, index) => (
                        <tr key={index}>
                          <td>{item.campaign}</td>
                          <td>{item.callStatusCounts.CONNECTED || null}</td>
                          <td>{item.callStatusCounts.DISCONNECTED || null}</td>
                          <td>{item.talkDurationSum}</td>
                          <td>{item.talkDurationAvg}</td>
                        </tr>
                      ))}
                      <tr>
                        <td><strong>Grand Total</strong></td>
                        <td>
                          <strong>{campaignData.reduce((sum, item) => sum + item.callStatusCounts.CONNECTED, 0)}</strong>
                        </td>
                        <td>
                          <strong>{campaignData.reduce((sum, item) => sum + item.callStatusCounts.DISCONNECTED, 0)}</strong>
                        </td>
                        <td>
                          <strong>{formatTime(campaignData.reduce((sum, item) => sum + parseTime(item.talkDurationSum), 0))}</strong>
                        </td>
                        <td>
                          <strong> {formatTime(campaignData.reduce((sum, item) => sum + parseTime(item.talkDurationAvg), 0))}</strong>
                        </td>
                      </tr>
                    </tbody>
                    <tbody >
                    </tbody>
                  </table>
                </div>

              </div>
              <div className='col-sm-6'>
                <h4><strong>Call Type Wise Status</strong></h4>
                <ReactApexChart options={chartOptions} series={series} type="bar" height={350} />

                <div className="table-responsive table-bordered">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Call Type</th>
                        {columnsToDisplay.map((campaign, index) => (
                          <th key={index}>{campaign}</th>
                        ))}
                        <th><strong>Grand Total</strong></th>
                      </tr>
                    </thead>
                    <tbody>
                      {secchartData.map((item, index) => {
                        const rowData = { ...item }; // Create a copy of the current row data
                        delete rowData.callType; // Remove 'callType' from the copied data

                        // Iterate over the column names and calculate column totals
                        columnsToDisplay.forEach((campaign) => {
                          if (!columnTotals[campaign]) {
                            columnTotals[campaign] = 0;
                          }
                          if (rowData[campaign]) {
                            columnTotals[campaign] += rowData[campaign];
                          }
                        });

                        return (
                          <tr key={index}>
                            <td>{item.callType}</td>
                            {columnsToDisplay.map((campaign, index) => (
                              <td key={index}>{rowData[campaign] || 0}</td>
                            ))}
                            <td><strong>{item.campaignCount}</strong></td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td><strong>Grand Total</strong></td>
                        {columnsToDisplay.map((campaign, index) => (
                          <td key={index}><strong>{columnTotals[campaign] || 0}</strong></td>
                        ))}
                        <td><strong>{secchartData.reduce((sum, item) => sum + item.campaignCount, 0)}</strong></td>
                      </tr>

                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default App;

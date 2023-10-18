import { useEffect, useState } from 'react';
import axios from 'axios'
import ReactApexChart from 'react-apexcharts';
import { Link } from 'react-router-dom';

export default function HomePage() {
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
    const [chartDataCamp, setChartDataCamp] = useState([])
    const [chartDataCallType, setChartDataCallType] = useState([])
  
  
    useEffect(() => {
      fetch(`http://localhost:7000/api/sum-users?date=${selectedDate}`)
        .then((response) => response.json())
        .then((data) => setUserData(data))
        .catch((error) => console.error('Error fetching data:', error));
  
      async function TotalData() {
        const Gdata = await axios.get(`http://localhost:7000/api/sum-totals-by-callstatus?date=${selectedDate}`);
        if (Gdata) {
          setGrandTotal(Gdata.data || null)
          setGrandTotalOddis(Gdata.data[1].callStatusCount || null)
        }
      }
      TotalData();
    }, [selectedDate]);
  
  
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
  
    function sortColumnUser(columnIndex) {
      const table = document.querySelector('.table');
      const tbody = table.querySelector('tbody');
      const rows = Array.from(tbody.querySelectorAll('tr'));
  
      const isAscending = table.getAttribute('data-sorted-by') === `${columnIndex}-asc`;
  
      rows.sort((rowA, rowB) => {
        const cellA = rowA.querySelectorAll('td')[columnIndex].textContent;
        const cellB = rowB.querySelectorAll('td')[columnIndex].textContent;
  
        if (isAscending) {
          return cellB.localeCompare(cellA);
        } else {
          return cellA.localeCompare(cellB);
        }
      });
  
      table.setAttribute('data-sorted-by', isAscending ? `${columnIndex}-desc` : `${columnIndex}-asc`);
      tbody.innerHTML = '';
      rows.forEach(row => tbody.appendChild(row));
    }
  
    function sortColumn(columnIndex) {
      const table = document.querySelector('.table');
      const tbody = table.querySelector('tbody');
      const rows = Array.from(tbody.querySelectorAll('tr'));
  
      const isAscending = table.getAttribute('data-sorted-by') === `${columnIndex}-asc`;
  
      rows.sort((rowA, rowB) => {
        const cellA = rowA.querySelectorAll('td')[columnIndex].textContent;
        const cellB = rowB.querySelectorAll('td')[columnIndex].textContent;
  
        const valueA = parseFloat(cellA) || 0;
        const valueB = parseFloat(cellB) || 0;
  
        if (isAscending) {
          return valueA - valueB;
        } else {
          return valueB - valueA;
        }
      });
  
      table.setAttribute('data-sorted-by', isAscending ? `${columnIndex}-desc` : `${columnIndex}-asc`);
      tbody.innerHTML = '';
      rows.forEach(row => tbody.appendChild(row));
    }
  
  
    useEffect(() => {
      axios.get('http://localhost:7000/cw')
        .then((res) => {
          setChartDataCamp(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
  
      axios.get('http://localhost:7000/ct')
        .then((res) => {
          setChartDataCallType(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }, []);
  
    // Filter and format data for "CAMPJD" campaign
    const campJDData = chartDataCamp
      .filter((data) => data.campaign === "CAMPJD")
      .map((data) => ({
        x: new Date(data.date).getTime(),
        y: timeStringToSeconds(data.totalTalkDuration),
      }));
  
    // Filter and format data for "pravin_patare" campaign
    const pravinData = chartDataCamp
      .filter((data) => data.campaign === "pravin_patare")
      .map((data) => ({
        x: new Date(data.date).getTime(),
        y: timeStringToSeconds(data.totalTalkDuration),
      }));
  
    const seriess = [
      {
        name: "CAMPJD",
        data: campJDData,
      },
      {
        name: "pravin_patare",
        data: pravinData,
      },
    ];
  
    const options = {
      chart: {
        id: 'line-chart',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        },
      },
      xaxis: {
        type: 'datetime',
      },
      yaxis: {
        labels: {
          formatter: (value) => {
            return secondsToTimeString(value);
          },
        },
      },
    };
  
  
    const callTypess = ["CRM DIAL", "MANUAL DIAL", "REDIAL"];
  
    const seriesss = callTypess.map((callType) => {
      const callTypeData = chartDataCallType
        .filter((data) => data.callType === callType)
        .map((data) => ({
          x: new Date(data.date).getTime(),
          y: timeStringToSeconds(data.totalTalkDuration),
          label: `${callType}: ${data.totalTalkDuration}`,
        }));
      return {
        name: callType,
        data: callTypeData,
      };
    });
  
    const optionss = {
      chart: {
        id: 'line-chart',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        },
      },
      xaxis: {
        type: 'datetime',
      },
      yaxis: {
        labels: {
          formatter: (value) => {
            return secondsToTimeString(value);
          },
        },
      },
  
    };
    function timeStringToSeconds(timeString) {
      const [hours, minutes, seconds] = timeString.split(':').map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    }
  
    function secondsToTimeString(seconds) {
      const hours = Math.floor(seconds / 3600);
      seconds %= 3600;
      const minutes = Math.floor(seconds / 60);
      seconds %= 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  return (
    <>
       <div className='App m-2 border rounded'>
        <div className='container'>
          <div className=' d-flex flex-wrap justify-content-between border-bottom'>
        
            <div className='bg-primary ms-1 mt-2 ps-1 pe-2 pt-2 border rounded'>
             
              <h4 className='text-light'>MIT-SDE</h4>
            </div>
            {/* <h5><i className="fa-solid fa-phone-volume pt-3"></i>&nbsp; {grandTotal[0].callStatusCount}</h5>
            <h5><i className="fa-regular fa-clock pt-3"></i> &nbsp;{grandTotal[0].talkDurationSum}</h5> */}
            <div>
              <select
                className='btn btn-outline-primary ms-3 dropdown-toggle me-1 mt-2 pe-1 pt-2'
                id="dateSelect"
                value={setSelectedDate || ''}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                <option value="">{selectedDate ? selectedDate : "All Month"}</option>
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
          </div>
    
          <div>
            <button className='btn btn-outline-primary m-1' onClick={() => showDiv(1)}>Over All</button>
            <button className='btn btn-outline-primary m-1' onClick={() => showDiv(2)}>Connected Calls</button>
            <button className='btn btn-outline-primary m-1' onClick={() => showDiv(3)}>Charts</button>
          </div>


          <div className="App" style={{ display: activeDiv === 1 ? 'block' : 'none' }}>
            <div className='container d-flex justify-content-around bg-primary p-1 mt-1'>
              <h4 className='text-white'>Over all</h4>
              <input
                type="text"
                placeholder="Search by User Name"
                value={searchText}
                onChange={handleSearchFirst}
              />
            </div>
            <div className='container table-responsive'>
              <table className='table table-hover' data-sorted-by="">
                <thead>
                  <tr>
                    <th style={{ cursor: "pointer", fontSize: "15px" }} onClick={() => sortColumnUser(0)}><i className="fa-solid fa-users pe-2"></i> Users <i className="fa-solid fa-arrow-down-a-z ps-2"></i></th>
                    <th style={{ cursor: "pointer", fontSize: "15px", backgroundColor: "#b5ffc4" }} onClick={() => sortColumn(1)}><i className="fa-solid fa-phone-volume pe-2"></i>Calls <i className="fa-solid fa-arrow-down-1-9 ps-2"></i></th>
                    <th style={{ cursor: "pointer", fontSize: "15px" }} onClick={() => sortColumn(2)}>Sum Talk Duration</th>
                    <th style={{ cursor: "pointer", fontSize: "15px", backgroundColor: "#ffb5b9" }} onClick={() => sortColumn(3)}><i className="fa-solid fa-phone-slash pe-2"></i>Calls <i className="fa-solid fa-arrow-down-1-9"></i></th>
                    <th style={{ fontSize: "15px" }}>SUM Talk Duration</th>
                    <th style={{ fontSize: "15px" }}>Count Of Call Status</th>
                    <th style={{ fontSize: "15px" }}>Sum Of Talk Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {searchText.length > 0 ? (
                    filteredData.map((user, index) => (
                      <tr key={index}>
                        <td><Link to={`/user/${user.userFullName}`}>{user.userFullName || null}</Link></td>
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
                        <td> <Link to={`/user/${user.userFullName}`}>{user.userFullName || null}</Link></td>
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
                    <tr className='table-dark'>
                      {/* <td><strong>{grandTotal[1].callStatus || null} Grand Total</strong></td> */}
                      <td><strong> Grand Total</strong></td>
                      <td><strong>{grandTotal[0].callStatusCount || null}</strong></td>
                      <td><strong>{grandTotal[0].talkDurationSum || null}</strong></td>
                      <td><strong>{grandTotalofDis || null}</strong></td>
                      <td><strong>0</strong></td>
                      <td><strong>{grandTotalofDis + grandTotal[0].callStatusCount || null}</strong></td>
                      <td><strong>{grandTotal[0].talkDurationSum || null}</strong></td>
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
            <div className='d-flex justify-content-around'>
              <p className='headingsize fw-bold'>Connected Calls</p>
              <input
                type="text"
                placeholder="Search by User Name"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className='container table-responsive'>
              <table className='table table-hover' data-sorted-by="">
                <thead>
                  <tr>
                    <th style={{ cursor: "pointer", fontSize: "15px" }} onClick={() => sortColumnUser(0)}><i className="fa-solid fa-users pe-2"></i> Users <i className="fa-solid fa-arrow-down-a-z ps-2"></i></th>
                    <th style={{ cursor: "pointer", fontSize: "15px" }} onClick={() => sortColumn(1)}><i className="fa-solid fa-phone-volume pe-2"></i>Calls <i className="fa-solid fa-arrow-down-1-9 ps-2"></i></th>
                    <th style={{ cursor: "pointer", fontSize: "15px" }} onClick={() => sortColumn(2)}>Sum Talk Duration</th>
                    <th style={{ cursor: "pointer", fontSize: "15px" }} onClick={() => sortColumn(3)}>Average Talk Duration</th>
                    <th style={{ cursor: "pointer", fontSize: "15px" }} onClick={() => sortColumn(4)}><i className="fa-solid fa-phone-slash pe-2"></i>Calls <i className="fa-solid fa-arrow-down-1-9"></i></th>
                  </tr>
                </thead>
                <tbody>

                  {searchQuery.length > 0 ? (
                    filteredUserData.map((user, index) => (
                      <tr key={index}>
                        <td><Link to={`/user/${user.userFullName}`}>{user.userFullName || null}</Link></td>
                        <td style={{ backgroundColor: "#b5ffc4" }}>{user.callStatusCounts.CONNECTED}</td>
                        <td>{user.talkDurationSum}</td>
                        <td>{user.talkDurationAvg}</td>
                        <td style={{ backgroundColor: "#ffb5b9" }}>{user.callStatusCounts.DISCONNECTED}</td>
                      </tr>
                    ))
                  ) : (
                    userData.map((user, index) => (
                      <tr key={index}>
                        <td><Link to={`/user/${user.userFullName}`}>{user.userFullName || null}</Link></td>
                        <td style={{ backgroundColor: "#b5ffc4" }}>{user.callStatusCounts.CONNECTED}</td>
                        <td>{user.talkDurationSum}</td>
                        <td>{user.talkDurationAvg}</td>
                        <td style={{ backgroundColor: "#ffb5b9" }}>{user.callStatusCounts.DISCONNECTED}</td>
                      </tr>
                    ))
                  )}
                  {grandTotal.length > 1 && grandTotal.slice(0, 1).map(() => (
                    <tr className='table-dark'>
                      {/* <td><strong>{grandTotal[1].callStatus || null}</strong></td> */}
                      <td><strong> Grand Total</strong></td>
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
              <h5 className='border-bottom'><strong>Charts</strong></h5>
              <div className='row'>
                <div className='col-sm-6 border-end'>
                  <h6><strong>Team Wise Call Status</strong></h6>
                  <ReactApexChart options={chartData.options} series={chartData.series} type="bar" height={300} />
                  <div className="table-responsive">
                    <table className="table table-striped table-bordered">
                      <thead>
                        <tr>
                          <th style={{ fontSize: "14px" }}>Campaign</th>
                          <th style={{ fontSize: "14px" }}>Connected</th>
                          <th style={{ fontSize: "14px" }}>Disconnected</th>
                          <th style={{ fontSize: "14px" }}>Talk D-Sum</th>
                          <th style={{ fontSize: "14px" }}>Talk D Avg</th>
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
                        <tr className='table-dark'>
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
                  <h6><strong>Call Type Wise Status</strong></h6>
                  <ReactApexChart options={chartOptions} series={series} type="bar" height={300} />
                  <div className="table-responsive table-bordered">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th style={{ fontSize: "14px" }}>Call Type</th>
                          {columnsToDisplay.map((campaign, index) => (
                            <th style={{ fontSize: "14px" }} key={index}>{campaign}</th>
                          ))}
                          <th style={{ fontSize: "14px" }}><strong>Grand Total</strong></th>
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
                        <tr className='table-dark'>
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
                <div className='col-sm-6 border-end'>
                  <h6 className='pt-1'><strong>Team wise Talk Duration</strong></h6>
                  <ReactApexChart options={options} series={seriess} type="line" height={350} />
                </div>
                <div className='col-sm-6'>
                  <h6><strong>Date wise Call Type Talk Duration </strong></h6>
                  <ReactApexChart options={optionss} series={seriesss} type="line" height={350} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>   
    </>
  )
}

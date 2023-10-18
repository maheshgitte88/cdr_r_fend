import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Pagination, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

export default function UserData() {
    const [userAllData, setUserAllData] = useState([]);
    const [status, setStatus] = useState('CONNECTED')
    const [callCount, setCallCount] =useState('')
    const [changeDate, setChangeDate] = useState([])
    const [userDataDate, setUserDataDate] = useState('')
    const { userFullName } = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 100;
    const maxPagesToShow = 15;

    useEffect(() => {
        axios
            .get(`http://localhost:7000/api/all/call-data/${userFullName}?status=${status}&date=${userDataDate}`)
            .then((res) => {
                setUserAllData(res.data);
                setCallCount(res.data.length)
            })
            .catch((err) => {
                console.log(err);
            });
    }, [userFullName, status, userDataDate]);

    const totalTalkDuration = calculateTotalTalkDuration(userAllData);

    function calculateTotalTalkDuration(data) {
        let totalHours = 0;
        let totalMinutes = 0;
        let totalSeconds = 0;
              data.forEach(item => {
          const [hours, minutes, seconds] = item.talkDuration.split(':').map(Number);
          totalHours += hours;
          totalMinutes += minutes;
          totalSeconds += seconds;
        });
      
        totalMinutes += Math.floor(totalSeconds / 60);
        totalSeconds %= 60;
        totalHours += Math.floor(totalMinutes / 60);
        totalMinutes %= 60;
      
        const formattedTotal = `${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
      
        return formattedTotal;
      }
      
      console.log('Total Talk Duration:', totalTalkDuration);

    useEffect(() => {
        axios.get('http://localhost:7000/api/unique-dates')
            .then((res) => {
                setChangeDate(res.data);
            })
            .catch((error) => {
                console.log(error)
            })
    }, [])

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const totalPages = Math.ceil(userAllData.length / itemsPerPage);

    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxPagesToShow) {
        const halfMax = Math.floor(maxPagesToShow / 2);

        if (currentPage <= halfMax) {
            endPage = maxPagesToShow;
        } else if (currentPage >= totalPages - halfMax) {
            startPage = totalPages - maxPagesToShow + 1;
        } else {
            startPage = currentPage - halfMax;
            endPage = currentPage + halfMax;
        }
    }

    const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = userAllData.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <>
            <div className="container mt-2">
                <h4 className='fw-bold text-center p-1 border'>{`All ${status} CALL OF :  ${userFullName}`}</h4>
                <div className='d-flex flex-wrap justify-content-between'>
                    <div>
                        <select className='btn btn-outline-primary ms-3 dropdown-toggle me-1 pe-1'
                            onChange={(e) => setStatus(e.target.value)}>
                            <option value={'CONNECTED'}><option>CONNECTED</option></option>
                            <option value={'DISCONNECTED'}>DISCONNECTED</option>
                        </select>

                        <select
                            className='btn btn-outline-primary ms-3 dropdown-toggle me-1 pe-1'
                            id="dateSelect"
                            value={setUserDataDate || ''}
                            onChange={(e) => setUserDataDate(e.target.value)}
                        >
                            <option value="">{userDataDate ? userDataDate : "All Month"}</option>
                            {changeDate.map((date) => (
                                <>
                                    <option key={date} value={date}>
                                        {date}
                                    </option>
                                </>
                            ))}
                            <option value={''}>All</option>
                        </select>

                        
                    </div>
                    <h5>{`${status} : ${callCount}`} </h5>
                    <h5>TIME: {totalTalkDuration} </h5>
                    <Pagination>
                        <Pagination.Prev
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        />

                        {pageNumbers.map((number) => (
                            <Pagination.Item
                                key={number}
                                active={number === currentPage}
                                onClick={() => handlePageChange(number)}
                            >
                                {number}
                            </Pagination.Item>
                        ))}

                        <Pagination.Next
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={indexOfLastItem >= userAllData.length}
                        />
                    </Pagination>
                </div>
                <Table responsive striped bordered hover>
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Date</th>
                            <th>Campaign</th>
                            <th>Call Status</th>
                            <th>Talk Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((item, index) => (
                            <tr key={index}>
                                <td>{item.userFullName}</td>
                                <td>{item.date}</td>
                                <td>{item.campaign}</td>
                                <td>{item.callStatus}</td>
                                <td>{item.talkDuration}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </>
    );
}

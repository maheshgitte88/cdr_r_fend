import axios from "axios";
import { useEffect, useState } from "react";



function CoinCapApp() {
    const [coinData, setCoinData] = useState([]);

    useEffect(() => {
        axios.get('https://api.coincap.io/v2/assets?limit=2')
            .then((res) => {
                setCoinData(res.data.data)
            })
            .catch((err) => {
                console.log(err);
            })
    }, [])

    console.log(coinData, 21)

    return (
        <>
            <div>
                <table className="table">
                    <thead>
                        <tr>
                            <td>symbol</td>
                            <td>name</td>
                            <td>priceUsd</td>
                            <td>24h Change</td>
                        </tr>
                    </thead>
                    <tbody>
                        {coinData.map((crypto) => (
                            <tr key={crypto.id}>
                                <td>{crypto.symbol}</td>
                                <td>{crypto.name}</td>
                                <td>{Number(crypto.priceUsd).toFixed(2)}</td> 
                                <td>{Number(crypto.changePercent24Hr).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>

        </>
    );
}

export default CoinCapApp;
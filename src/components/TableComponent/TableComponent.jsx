import React, { useEffect, useState } from "react";
import styles from "./TableComponent.module.scss";
import DataTable from "react-data-table-component";
import { MoveDown, MoveUp } from "lucide-react";
import clsx from "clsx";

const topCoins = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "XRPUSDT",
  "ADAUSDT",
  "DOGEUSDT",
  "SOLUSDT",
  "DOTUSDT",
  "MATICUSDT",
  "LTCUSDT",
];

const TableComponent = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    coinName: "",
    minValue: null,
    priceChange: null,
  });

  const handleInputChange = (e) => {
    setSortConfig({
      ...sortConfig,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/!ticker@arr");

    ws.onmessage = (event) => {
      const allCoins = JSON.parse(event.data);
      setData(allCoins);
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    let initialData = data.filter((coin) => coin.s.includes("USDT"));

    if (sortConfig.priceChange) {
      initialData = initialData?.filter((c) =>
        sortConfig.priceChange.includes("-")
          ? parseFloat(c.P) < parseFloat(sortConfig.priceChange)
          : parseFloat(c.P) > parseFloat(sortConfig.priceChange)
      );
    }

    if (sortConfig.minValue) {
      initialData = initialData?.filter(
        (c) => parseFloat(c.c) >= parseFloat(sortConfig.minValue)
      );
    }

    if (sortConfig.coinName) {
      initialData = initialData?.filter((c) =>
        c.s.toLowerCase().includes(sortConfig.coinName.toLowerCase())
      );
    }

    setFilteredData(initialData);
  }, [sortConfig, data]);

  const columns = [
    {
      name: "Symbol",
      selector: (row) => row.s,
      cell: (row) => <div className={styles.text}>{row.s}</div>,
    },
    {
      name: "Price",
      selector: (row) => parseFloat(row.c),
      cell: (row) => (
        <div className={styles.text}>
          <p>${parseFloat(row.c)}</p>
        </div>
      ),
      center: true,
      sortable: true,
    },
    {
      name: "Price Change (%)",
      selector: (row) => parseFloat(row.P).toFixed(2),
      cell: (row) => (
        <div
          className={clsx(
            styles.percentPill,
            row.P > 0 ? styles.percentUp : styles.percentDown
          )}
        >
          {row.P > 0 ? (
            <MoveUp size={12} color="#1dc727" />
          ) : (
            <MoveDown size={12} color="#ff094a" />
          )}
          <p>{parseFloat(row.P).toFixed(2)}%</p>
        </div>
      ),
      center: true,
      sortable: true,
    },
    {
      name: "24h Volume",
      selector: (row) => parseFloat(row.v).toFixed(2),
      cell: (row) => (
        <div className={styles.text}>
          ${(parseFloat(row.v) / 1000000).toFixed(2)}M - $
          {parseFloat(row.v).toFixed(2)}
        </div>
      ),
      center: true,
      sortable: true,
    },
  ];

  const customStyles = {
    table: {
      style: {
        backgroundColor: "transparent",
        width: "100%",
      },
    },
    headRow: {
      style: {
        backgroundColor: "transparent",
        color: "#fff",
        fontWeight: "bold",
      },
    },
    headCells: {
      style: {
        lineHeight: "1.75rem",
        fontSize: "1.25rem",
        fontWeight: "500",
        textTransform: "capitalize",
        color: "white",
        paddingLeft: 0,
        paddingRight: 0,
        justifyContent: "center",

        "&:first-child": {
          justifyContent: "flex-start",
        },
      },
    },
    cells: {
      style: {
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
    rows: {
      style: {
        backgroundColor: "transparent",
        borderBottom: ".0625rem solid #5555 !important",
        color: "white",
      },
    },
  };

  return (
    <div className={styles.container}>
      <section>
        <div className={styles.config}>
          <input
            value={sortConfig.coinName}
            onChange={handleInputChange}
            type="text"
            placeholder="Name"
            name="coinName"
          />
          <input
            value={sortConfig.minValue}
            onChange={handleInputChange}
            type="number"
            placeholder="Minimum Price"
            name="minValue"
          />
          <input
            value={sortConfig.priceChange}
            onChange={handleInputChange}
            type="number"
            placeholder="Price Change"
            name="priceChange"
          />
        </div>
        <DataTable
          columns={columns}
          data={filteredData}
          customStyles={customStyles}
          responsive
        />
      </section>
    </div>
  );
};

export default TableComponent;

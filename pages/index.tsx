import React, { useState } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";

import { Button, Space } from "antd/lib";
import { Company } from "./api/download";

export default function Home() {
  const [clutchReport, setClutchReportStatus] = useState<boolean>();
  const [loading, setLoading] = useState<boolean>(false);
  const [scrapedData, setScrapedData] = useState<Company[]>([]);
  const [error, setError] = useState<string>("");

  const handleDownload = async () => {
    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: scrapedData }),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      const now = new Date();
      const formattedDate = now.toLocaleString();

      link.href = url;
      link.setAttribute("download", `report${formattedDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading Excel file:", error);
    }
  };

  const handleClick = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/scrape", { method: "POST" });
      const data = await response.json();
      setScrapedData(data);
    } catch (error) {
      console.error("Error:", error);
      setError(error);
    }
    setLoading(false);
  };

  console.log({ scrapedData });

  return (
    <div className={styles.container}>
      <Head>
        <title>Scrapping</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {error && <div style={{ color: "red" }}>Error: {error}</div>}
        <h1>Scraped Data</h1>
        <Space direction="horizontal" size={16}>
          <Button loading={loading} onClick={handleClick}>
            Generate Clutch report
          </Button>
          {scrapedData.length > 0 && (
            <Button onClick={handleDownload} type="primary">
              Download Excel
            </Button>
          )}
        </Space>
      </main>

      <footer>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <img src="/vercel.svg" alt="Vercel" className={styles.logo} />
        </a>
      </footer>

      <style jsx>{`
        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        footer img {
          margin-left: 0.5rem;
        }
        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
          text-decoration: none;
          color: inherit;
        }
        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family:
            Menlo,
            Monaco,
            Lucida Console,
            Liberation Mono,
            DejaVu Sans Mono,
            Bitstream Vera Sans Mono,
            Courier New,
            monospace;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            Segoe UI,
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            Fira Sans,
            Droid Sans,
            Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}

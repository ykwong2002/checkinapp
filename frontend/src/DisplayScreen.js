import React, { useEffect, useState } from 'react';

function DisplayScreen() {
  const [readyNumber, setReadyNumber] = useState(null);
  const [missedNumbers, setMissedNumbers] = useState([]);

  const fetchData = async () => {
    try {
      const readyRes = await fetch('/api/ready');
      const readyData = await readyRes.json();
      setReadyNumber(readyData.ready_number);
      const missedRes = await fetch('/api/missed');
      const missedData = await missedRes.json();
      setMissedNumbers(missedData.missed_numbers);
    } catch (err) {
      setReadyNumber(null);
      setMissedNumbers([]);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Key Ready for Collection</h1>
      <div className="text-9xl font-extrabold text-green-600 mb-12">
        {readyNumber !== null ? readyNumber : '--'}
      </div>
      <div className="w-full max-w-xl bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">Missed Queue</h2>
        <div className="flex flex-wrap gap-4">
          {missedNumbers.length === 0 ? (
            <span className="text-gray-400">No missed numbers</span>
          ) : (
            missedNumbers.map((num) => (
              <span key={num} className="text-xl font-bold text-red-500 bg-red-100 px-4 py-2 rounded">
                {num}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DisplayScreen; 
// import React, { useState } from 'react';
// import axios from 'axios';

// function AadhaarVerificationPage() {
//   const [aadhaar, setAadhaar] = useState('');
//   const [refId, setRefId] = useState('762674765');
//   const [response, setResponse] = useState(null);
//   const [error, setError] = useState(null);

//   const handleVerify = async () => {
//     try {
//       const res = await axios.post(
//         '/sprintverify-uat/api/v1/verification/aadhaar_without_otp',
//         {
//           refid: refId,
//           id_number: aadhaar
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             'Token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aW1lc3RhbXAiOjE3MjQzMDM2NjUsInBhcnRuZXJJZCI6IkNPUlAwMDAwMSIsInJlcWlkIjoiODkyODg3MjQ4MiJ9.aM35DPse00dyQZ6ifzKVOf4q0vQVYOZMPwo7Jh-qnRM',
//             'authorisedkey': 'TVRJek5EVTJOelUwTnpKRFQxSlFNREF3TURFPQ=='
//           }
//         }
//       );
//       if (res.status === 400) {
//         setError('Bad Request: The server could not process your request');
//       } else {
//         setResponse(res.data);  // If the request is successful, set the response data
//       }

//     } catch (err) {
//       // Handle other types of errors (network, server errors, etc.)
//       if (err.response && err.response.status === 400) {
//         setError('Bad Request: Invalid input or missing parameters');
//       } else {
//         setError(err.message);  // Other errors (e.g., network failure)
//       }
//     }
//   };

//   return (
//     <div>
//       <h1>Aadhaar Verification</h1>
//       <input
//         type="text"
//         placeholder="Enter Aadhaar Number"
//         value={aadhaar}
//         onChange={(e) => setAadhaar(e.target.value)}
//       />
//       <button onClick={handleVerify}>Verify</button>

//       {response && (
//         <pre>{JSON.stringify(response, null, 2)}</pre>
//       )}
//       {error && (
//         <div style={{ color: 'red' }}>Error: {error}</div>
//       )}
//     </div>
//   );
// }

// export default AadhaarVerificationPage;

import React, { useState } from 'react';
import axios from 'axios';

function AadhaarVerificationPage() {
  const [aadhaar, setAadhaar] = useState('');
  const [refId, setRefId] = useState('762674765');
  const [response, setResponse] = useState(null);

  const handleVerify = async () => {
    setResponse(null); // clear previous result

    // 🔍 Blank check
    if (!aadhaar.trim()) {
      setResponse({
        statuscode: 201,
        status: false,
        message: "The id number field is required."
      });
      return;
    }

    // 🔍 Letter/symbol check
    if (!/^\d+$/.test(aadhaar)) {
      setResponse({
        statuscode: 201,
        status: false,
        message: "Aadhaar must contain only digits"
      });
      return;
    }

    // 🔍 Length check
    if (aadhaar.length !== 12) {
      setResponse({
        statuscode: 201,
        status: false,
        message: "Aadhaar number must be exactly 12 digits"
      });
      return;
    }

    // ✅ API call if all checks pass
    try {
      const res = await axios.post(
        '/sprintverify-uat/api/v1/verification/aadhaar_without_otp',
        {
          refid: refId,
          id_number: aadhaar
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Token': 'your-token-here',
            'authorisedkey': 'your-authorised-key-here'
          }
        }
      );

      setResponse(res.data);

    } catch (err) {
      // fallback for API/network errors
      setResponse({
        statuscode: err.response?.status || 500,
        status: false,
        message: err.response?.data?.message || 'Server error'
      });
    }
  };

  return (
    <div>
      <h1>Aadhaar Verification</h1>

      <input
        type="text"
        placeholder="Enter 12-digit Aadhaar Number"
        value={aadhaar}
        onChange={(e) => setAadhaar(e.target.value)}
      />

      <button onClick={handleVerify}>Verify</button>

      {response && (
        <pre style={{ marginTop: '10px' }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default AadhaarVerificationPage;

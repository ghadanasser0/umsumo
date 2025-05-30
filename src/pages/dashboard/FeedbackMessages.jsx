import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import Header from '../../parts/Header';
import Footer from '../../parts/Footer';

export default function FeedbackMessages() {
  const [data, setData] = useState(null);
  const [update, setUpdate] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, [update]);

  const loadFeedback = () => {
    supabase
      .from("feedback")
      .select("*")
      .then(resData => {
        if (resData.data && resData.data.length !== 0) {
          setData(resData.data);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const handleDelete = (id) => {
    let r = window.confirm("Are you sure to delete this message?");
    if (r) {
      supabase
        .from("feedback")
        .delete()
        .eq('id', id)
        .then(() => {
          setUpdate(Date.now());
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  const openWhatsApp = (number) => {
    const phone = number.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  const handleFilterByDate = (e) => {
    e.preventDefault();
    const from = e.target.from.value;
    const to = e.target.to.value;

    if (!from || !to) {
      alert("Please select both dates.");
      return;
    }

    supabase
      .from("feedback")
      .select("*")
      .then(res => {
        if (res.data && res.data.length > 0) {
          const filtered = res.data.filter(item =>
            new Date(item.created_at) >= new Date(from + "T00:00:00") &&
            new Date(item.created_at) <= new Date(to + "T23:59:59")
          );
          setData(filtered);
        }
      })
      .catch(err => console.log(err));
  };

  const analyzeFeedback = async () => {
    if (!data || data.length === 0) return;
    setLoading(true);

    const notes = data.map(item => item.note).join("\n");

    const message = {
      role: "user",
      parts: [
        {
          text: `You will receive a list of feedback comments. Classify each as Positive, Negative, or Irrelevant (ignore irrelevant ones like 'test', '...','111' etc). Display the results in an HTML table with proper spacing. Then below that, display a second summary table with the count and percentage for each category. Conclude with a short paragraph summarizing the sentiment.
${notes}`
        }
      ]
    };

    try {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDA-3WYb5lmDPiGRKX0TTMKAX_3FVyFfUY', {
        method: 'POST',
        headers: {
          'Content-Type': "application/json"
        },
        body: JSON.stringify({ contents: message })
      });

      const result = await res.json();
      const rawHTML = result.candidates?.[0]?.content?.parts?.[0]?.text || "No result.";
      setAnalysis(rawHTML);
    } catch (err) {
      console.error(err);
      setAnalysis("Failed to analyze feedback.");
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => {
    if (!analysis) return;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Feedback Report</title></head><body style="font-family:Arial, sans-serif; font-size:13px; padding:20px;">');
    printWindow.document.write(analysis);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <Header />
      <div className="padding" style={{ width: '75%', margin: 'auto' }}>
        <h3>Feedback Messages:</h3>

        <form onSubmit={handleFilterByDate} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            From:
            <input type="date" name="from" style={{ padding: '8px 12px', borderRadius: '25px', border: '1px solid #ccc' }} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            To:
            <input type="date" name="to" style={{ padding: '8px 12px', borderRadius: '25px', border: '1px solid #ccc' }} />
          </label>
          <button type="submit" style={{ padding: '8px 20px', borderRadius: '25px', backgroundColor: '#694ceb', color: 'white', border: 'none', cursor: 'pointer' }}>Filter</button>
        </form>

        {data && data.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={analyzeFeedback} style={{ padding: '8px 20px', borderRadius: '25px', backgroundColor: '#694ceb', color: 'white', border: 'none', cursor: 'pointer' }}>
              Analyze Sentiment
            </button>
            <button onClick={printReport} style={{ padding: '8px 20px', borderRadius: '25px', backgroundColor: '#694ceb', color: 'white', border: 'none', cursor: 'pointer' }}>
              Print Report
            </button>
          </div>
        )}

        {loading && <p>Analyzing feedback...</p>}

       {analysis && (
  <div
    style={{
      backgroundColor: 'var(--analysis-bg, #fff)',
      color: 'var(--analysis-text, #000)',
      padding: '15px',
      borderRadius: '10px',
      marginBottom: '20px',
      overflowX: 'auto',
    }}
  >
    <h4 style={{ color: 'inherit' }}>Feedback Analysis Report:</h4>
    <div
      style={{
        fontSize: '13px',
        whiteSpace: 'pre-wrap',
        color: 'inherit',
      }}
      dangerouslySetInnerHTML={{ __html: analysis }}
    ></div>
  </div>
)}

       

        {data && data.length > 0 ? data.map(item => (
          <div key={"feedback-" + item.id} style={{ background: '#fff', padding: 10, borderRadius: 15, color: '#000', textDecoration: 'none', margin: 5 }}>
            <p><strong>Date:</strong> {new Date(item.created_at).toLocaleString("en-GB")}</p>
            <h3><strong>Name:</strong> {item.name}</h3>
            <p><strong>Email:</strong> {item.email}</p>
            {item.mobile && (<p><strong>Phone:</strong> {item.mobile}</p>)}
            <p>{item.note}</p>
            <div>
              {(item.mobile && item.mobile !== "") && (
                <button onClick={() => openWhatsApp(item.mobile)} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginRight: 10 }}>WhatsApp</button>
              )}
              <button className='delete-btn' onClick={() => handleDelete(item.id)} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        )) : (
          <p>No feedback messages found for the selected date range.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}

import React, { useMemo } from 'react';

const chartData = useMemo(() => {
  // Count female students per college
  const collegeFemaleCounts = {};
  data.forEach(student => {
    const college = student?.["College"];
    const gender = student?.["Gender"];
    if (college && gender?.toLowerCase() === 'female') {
      collegeFemaleCounts[college] = (collegeFemaleCounts[college] || 0) + 1;
    }
  });

  // Sort colleges by female count
  const sortedColleges = Object.entries(collegeFemaleCounts)
    .sort(([, a], [, b]) => b - a);

  return {
    labels: sortedColleges.map(([college]) => college),
    datasets: [
      {
        label: 'Female Students',
        data: sortedColleges.map(([, count]) => count),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }
    ]
  };
}, [data]);

const options = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: true,
      text: 'Female Students per College',
      font: {
        size: 16,
        weight: 'bold'
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Number of Female Students'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Colleges'
      }
    }
  }
}; 
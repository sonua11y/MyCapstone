import * as React from "react"
import { Line, Bar, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import "../styles/chart.css"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const Chart = React.forwardRef(({ type = "line", data, options, className, ...props }, ref) => {
  const renderChart = () => {
    switch (type) {
      case "line":
        return <Line data={data} options={options} />
      case "bar":
        return <Bar data={data} options={options} />
      case "pie":
        return <Pie data={data} options={options} />
      default:
        return <Line data={data} options={options} />
    }
  }

  return (
    <div
      ref={ref}
      className={`chart ${className || ''}`}
      {...props}
    >
      {renderChart()}
    </div>
  )
})
Chart.displayName = "Chart"

export { Chart } 
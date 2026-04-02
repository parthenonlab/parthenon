import { Chart as ChartJS, registerables } from 'chart.js';
import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';

import { INITIAL_WORDLE } from '@/constants/stats';
import { WordleStats } from '@parthenonlab/types';

import styles from '../styles/stats.module.scss';

ChartJS.register(...registerables, ChartDataLabels);

export const Stats = ({ data = INITIAL_WORDLE }: { data?: WordleStats }) => {
  const winPercentage = !data.totalPlays
    ? 'N/A'
    : Math.round((data.totalWon / data.totalPlays) * 100) + '%';

  return (
    <div className={styles.container}>
      <div className={styles.stats}>
        <h3>STATS</h3>
        <p>Win Percentage: {winPercentage}</p>
        <p>Max Streak: {data.maxStreak}</p>
        <p>Current Streak: {data.currentStreak}</p>
        <p>Total Times Played: {data.totalPlays}</p>
        <p>Guess Distribution</p>
      </div>
      <Bar
        className={styles.chart}
        options={{
          indexAxis: 'y',
          layout: {
            padding: {
              left: 10,
              right: 20,
            },
          },
          plugins: {
            datalabels: {
              align: 'end',
              anchor: 'end',
              display: (context: Context) =>
                context.dataset.data[context.dataIndex] !== 0,
              offset: 0,
            },
            legend: {
              display: false,
            },
            tooltip: {
              enabled: false,
            },
          },
          scales: {
            x: {
              ticks: {
                display: false,
              },
            },
          },
        }}
        data={{
          labels: ['1', '2', '3', '4', '5', '6'],
          datasets: [
            {
              data: data.distribution,
              backgroundColor: 'rgba(106, 170, 100, 0.5)',
              borderColor: 'rgb(106, 170, 100)',
              borderWidth: 1,
            },
          ],
        }}
      />
    </div>
  );
};

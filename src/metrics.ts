import { StatsD } from 'node-statsd'

const environment = process.env.NODE_ENV
const graphite = '127.0.0.1'

if (graphite == null) {
    throw new Error('Graphite host not configured!')
}

const options = {
    host: graphite,
    port: 8125,
    prefix: `${environment}.sinerider-api.`,
}

const metrics = new StatsD(options)

export default metrics;

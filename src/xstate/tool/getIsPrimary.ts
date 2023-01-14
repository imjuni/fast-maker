import cluster from 'node:cluster';

export default function getIsPrimary() {
  if ('isPrimary' in cluster) {
    return cluster.isPrimary;
  }

  if ('isMaster' in cluster) {
    return cluster.isMaster;
  }

  return true;
}

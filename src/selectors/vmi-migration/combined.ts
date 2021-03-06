import { K8sResourceKind } from '@kubevirt-types';

import { getNamespace } from '../selectors';

import { getMigrationVMIName, isMigrating } from './selectors';

export const findVMIMigration = (
  name: string,
  namespace: string,
  migrations?: K8sResourceKind[],
) => {
  if (!migrations) {
    return null;
  }

  return migrations
    .filter((m) => getNamespace(m) === namespace && getMigrationVMIName(m) === name)
    .find(isMigrating);
};

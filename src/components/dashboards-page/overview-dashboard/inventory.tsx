import * as _ from 'lodash';
import * as React from 'react';

import { InventoryStatusGroup } from '@kubevirt-internal';
import { K8sResourceKind, PersistentVolumeClaimKind, PodKind } from '@kubevirt-types';
import { OffIcon } from '@patternfly/react-icons';

import { StatusSimpleLabel } from '../../../constants/status-constants';
import { VMStatusSimpleLabel } from '../../../constants/vm/vm-status';
import { VMImportWrappper } from '../../../k8s/wrapper/vm-import/vm-import-wrapper';
import { getNamespace } from '../../../selectors';
import { isVM, isVMImport } from '../../../selectors/check-type';
import { getVMStatus } from '../../../statuses/vm/vm-status';
import { getVMImportStatus } from '../../../statuses/vm-import/vm-import-status';
import { VMIKind, VMKind } from '../../../types';
import { V1alpha1DataVolume } from '../../../types/api';
import { VMImportKind } from '../../../types/vm-import/ovirt/vm-import';
import { createBasicLookup, getBasicID } from '../../../utils';

import './inventory.scss';

export const getVMStatusGroups = (
  vms,
  {
    vmis,
    pods,
    migrations,
    pvcs,
    dataVolumes,
    vmImports,
  }: {
    vmis?: VMIKind[];
    pods?: PodKind[];
    pvcs?: PersistentVolumeClaimKind[];
    dataVolumes?: V1alpha1DataVolume[];
    migrations?: K8sResourceKind[];
    vmImports?: VMImportKind[];
  },
) => {
  const groups = {
    [InventoryStatusGroup.NOT_MAPPED]: {
      statusIDs: [VMStatusSimpleLabel.Running],
      count: 0,
      filterType: 'vm-status',
    },
    [InventoryStatusGroup.PROGRESS]: {
      statusIDs: [
        StatusSimpleLabel.Importing,
        VMStatusSimpleLabel.Starting,
        VMStatusSimpleLabel.Migrating,
        VMStatusSimpleLabel.Stopping,
        StatusSimpleLabel.Pending,
        VMStatusSimpleLabel.Deleting,
      ],
      count: 0,
      filterType: 'vm-status',
    },
    [InventoryStatusGroup.ERROR]: {
      statusIDs: [StatusSimpleLabel.Error],
      count: 0,
      filterType: 'vm-status',
    },
    [InventoryStatusGroup.WARN]: {
      statusIDs: [VMStatusSimpleLabel.Paused],
      count: 0,
      filterType: 'vm-status',
    },
    [InventoryStatusGroup.UNKNOWN]: {
      statusIDs: [StatusSimpleLabel.Other],
      count: 0,
      filterType: 'vm-status',
    },
    'vm-stopped': {
      statusIDs: [VMStatusSimpleLabel.Stopped],
      count: 0,
      filterType: 'vm-status',
    },
  };

  const vmisLookup = createBasicLookup<VMIKind>(vmis, getBasicID);

  const virtualMachines = _.unionBy(
    // order of arrays designates the priority
    vms,
    vmis,
    vmImports,
    (entity: VMKind | VMIKind | VMImportKind) =>
      isVMImport(entity)
        ? `${getNamespace(entity)}-${new VMImportWrappper(entity).getResolvedVMTargetName()}`
        : getBasicID(entity),
  );

  virtualMachines
    .map((obj: VMKind | VMIKind | VMImportKind) => {
      if (isVMImport(obj)) {
        const statusBundle = getVMImportStatus({
          vmImport: obj,
        });
        if (statusBundle.status.isCompleted()) {
          return null;
        }
        return statusBundle.status.getSimpleLabel();
      }
      const lookupID = getBasicID(obj);
      let vm = null;
      let vmi;

      if (isVM(obj)) {
        vm = obj;
        vmi = vmisLookup[lookupID];
      } else {
        vmi = obj;
      }
      return getVMStatus({
        vm,
        vmi,
        pods,
        migrations,
        pvcs,
        dataVolumes,
        vmImports,
      }).status.getSimpleLabel();
    })
    .filter((simpleStatus) => simpleStatus)
    .forEach((simpleStatus) => {
      const group =
        Object.keys(groups).find((key) => groups[key].statusIDs.includes(simpleStatus)) ||
        InventoryStatusGroup.UNKNOWN;
      groups[group].count++;
    });

  return groups;
};

export const VMOffGroupIcon: React.FC = () => (
  <OffIcon className="kubevirt-inventory-card__status-icon--off" />
);

import * as _ from 'lodash';

import { PersistentVolumeClaimModel, PodModel } from '@kubevirt-models';
import { URLHealthHandler } from '@kubevirt-types';
import { HealthState } from '@openshift-console/dynamic-plugin-sdk';

import {
  DataVolumeModel,
  VirtualMachineImportModel,
  VirtualMachineInstanceMigrationModel,
  VirtualMachineInstanceModel,
} from '../../../models';

export const getKubevirtHealthState: URLHealthHandler<KubevirtHealthResponse> = (
  response,
  error,
) => {
  if (error) {
    return { state: HealthState.NOT_AVAILABLE };
  }
  if (!response) {
    return { state: HealthState.LOADING };
  }
  return _.get(response, 'apiserver.connectivity') === 'ok'
    ? { state: HealthState.OK }
    : { state: HealthState.ERROR };
};

type KubevirtHealthResponse = {
  apiserver: {
    connectivity: string;
  };
};

export const additionalResources = {
  vmis: {
    isList: true,
    kind: VirtualMachineInstanceModel.kind,
  },
  pods: {
    isList: true,
    kind: PodModel.kind,
  },
  migrations: {
    isList: true,
    kind: VirtualMachineInstanceMigrationModel.kind,
  },
  pvcs: {
    isList: true,
    kind: PersistentVolumeClaimModel.kind,
    optional: true,
  },
  dataVolumes: {
    kind: DataVolumeModel.kind,
    isList: true,
    optional: true,
  },
  vmImports: {
    isList: true,
    kind: VirtualMachineImportModel.kind,
    optional: true,
  },
};

import * as React from 'react';

import { PersistentVolumeClaimModel, PodModel } from '@kubevirt-models';
import { PersistentVolumeClaimKind, PodKind } from '@kubevirt-types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { CDI_APP_LABEL, TEMPLATE_VM_NAME_LABEL } from '../constants';
import { DataVolumeModel, VirtualMachineInstanceModel, VirtualMachineModel } from '../models';
import { kubevirtReferenceForModel } from '../models/kubevirtReferenceForModel';
import { VMIKind, VMKind } from '../types';
import { V1alpha1DataVolume } from '../types/api';

type CustomizeVMTResourcesResult = {
  vm: VMKind;
  vmi: VMIKind;
  pods: PodKind[];
  dataVolumes: V1alpha1DataVolume[];
  pvcs: PersistentVolumeClaimKind[];
  loaded: boolean;
  loadError: any;
};

export const useCustomizeVMTResources = (
  name: string,
  namespace: string,
): CustomizeVMTResourcesResult => {
  const [vm, vmLoaded, vmLoadError] = useK8sWatchResource<VMKind>({
    kind: kubevirtReferenceForModel(VirtualMachineModel),
    name,
    namespace,
    isList: false,
  });

  const [vmis, vmisLoaded, vmiLoadError] = useK8sWatchResource<VMIKind>({
    kind: kubevirtReferenceForModel(VirtualMachineInstanceModel),
    namespace,
    isList: true,
    fieldSelector: `metadata.name=${name}`,
  });

  const vmi = vmis?.[0];

  const [vmPods] = useK8sWatchResource<PodKind[]>({
    kind: PodModel.kind,
    namespace,
    isList: true,
    selector: {
      matchLabels: {
        [TEMPLATE_VM_NAME_LABEL]: name,
      },
    },
  });

  const [cdiPods] = useK8sWatchResource<PodKind[]>({
    kind: PodModel.kind,
    namespace,
    isList: true,
    selector: {
      matchLabels: {
        app: CDI_APP_LABEL,
      },
    },
  });

  const [dataVolumes] = useK8sWatchResource<V1alpha1DataVolume[]>({
    kind: kubevirtReferenceForModel(DataVolumeModel),
    namespace,
    isList: true,
  });

  const [pvcs] = useK8sWatchResource<PersistentVolumeClaimKind[]>({
    kind: PersistentVolumeClaimModel.kind,
    namespace,
    isList: true,
  });

  const pods = React.useMemo(() => [...vmPods, ...cdiPods], [cdiPods, vmPods]);

  return {
    vm,
    vmi,
    pods,
    dataVolumes,
    pvcs,
    loaded: vmLoaded && vmisLoaded,
    loadError: vmLoadError || vmiLoadError,
  };
};

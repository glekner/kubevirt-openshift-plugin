import * as React from 'react';

import { createModalLauncher, Firehose, ModalComponentProps } from '@kubevirt-internal';
import { k8sPatch } from '@kubevirt-internal/utils';
import {
  NamespaceModel,
  PersistentVolumeClaimModel,
  ProjectModel,
  StorageClassModel,
} from '@kubevirt-models';
import { PersistentVolumeClaimKind, StorageClassResourceKind } from '@kubevirt-types';
import { FirehoseResult } from '@openshift-console/dynamic-plugin-sdk';

import { useStorageClassConfigMapWrapped } from '../../../hooks/storage-class-config-map';
import { getUpdateDiskPatches } from '../../../k8s/patches/vm/vm-disk-patches';
import { CombinedDiskFactory } from '../../../k8s/wrapper/vm/combined-disk';
import { DataVolumeWrapper } from '../../../k8s/wrapper/vm/data-volume-wrapper';
import { DiskWrapper } from '../../../k8s/wrapper/vm/disk-wrapper';
import { VMWrapper } from '../../../k8s/wrapper/vm/vm-wrapper';
import { VMIWrapper } from '../../../k8s/wrapper/vm/vmi-wrapper';
import { VolumeWrapper } from '../../../k8s/wrapper/vm/volume-wrapper';
import { connectWithStore } from '../../../redux/connectWithStore';
import { getName, getNamespace } from '../../../selectors';
import { isTemplate } from '../../../selectors/check-type';
import { getVMLikeModel } from '../../../selectors/vm/vmlike';
import { VMIKind, VMKind } from '../../../types';
import { V1alpha1DataVolume, V1Disk, V1Volume } from '../../../types/api';
import { VMLikeEntityKind } from '../../../types/vmLike';
import { getLoadedData } from '../../../utils';
import { TemplateValidations } from '../../../utils/validations/template/template-validations';

import { DiskModal } from './disk-modal';

const DiskModalFirehoseComponent: React.FC<DiskModalFirehoseComponentProps> = (props) => {
  const {
    disk,
    volume,
    dataVolume,
    vmLikeEntity,
    vmLikeEntityLoading,
    isVMRunning,
    vm,
    vmi,
    ...restProps
  } = props;

  const vmLikeFinal = getLoadedData<VMLikeEntityKind>(vmLikeEntityLoading, vmLikeEntity); // default old snapshot before loading a new one

  const diskWrapper = new DiskWrapper(disk);
  const volumeWrapper = new VolumeWrapper(volume);
  const dataVolumeWrapper = new DataVolumeWrapper(dataVolume);

  const combinedDiskFactory = CombinedDiskFactory.initializeFromVMLikeEntity(vmLikeFinal);

  const onSubmit = async (resultDisk, resultVolume, resultDataVolume) =>
    k8sPatch(
      getVMLikeModel(vmLikeEntity),
      vmLikeEntity,
      getUpdateDiskPatches(vmLikeEntity, {
        disk: new DiskWrapper(diskWrapper, true).mergeWith(resultDisk).asResource(),
        volume: new VolumeWrapper(volumeWrapper, true).mergeWith(resultVolume).asResource(),
        dataVolume:
          resultDataVolume &&
          new DataVolumeWrapper(dataVolume, true).mergeWith(resultDataVolume).asResource(),
        oldDiskName: diskWrapper.getName(),
        oldVolumeName: volumeWrapper.getName(),
        oldDataVolumeName: dataVolumeWrapper.getName(),
      }),
    );

  const storageClassConfigMap = useStorageClassConfigMapWrapped();

  const usedDisks = !isVMRunning
    ? new VMWrapper(vm).getDisks().map((usedDisk) => usedDisk.name)
    : new VMIWrapper(vmi).getDisks().map((usedDisk) => usedDisk.name);

  return (
    <DiskModal
      {...restProps}
      storageClassConfigMap={storageClassConfigMap}
      usedDiskNames={new Set(usedDisks)}
      usedPVCNames={combinedDiskFactory.getUsedDataVolumeNames(dataVolumeWrapper.getName())}
      vmName={getName(vmLikeFinal)}
      vmNamespace={getNamespace(vmLikeFinal)}
      disk={new DiskWrapper(diskWrapper, true)}
      volume={new VolumeWrapper(volumeWrapper, true)}
      dataVolume={new DataVolumeWrapper(dataVolumeWrapper, true)}
      onSubmit={onSubmit}
      isVMRunning={isVMRunning}
      vm={vm}
      vmi={vmi}
    />
  );
};

type DiskModalFirehoseComponentProps = ModalComponentProps & {
  disk?: V1Disk;
  volume?: V1Volume;
  dataVolume?: V1alpha1DataVolume;
  isEditing?: boolean;
  namespace: string;
  onNamespaceChanged: (namespace: string) => void;
  storageClasses?: FirehoseResult<StorageClassResourceKind[]>;
  persistentVolumeClaims?: FirehoseResult<PersistentVolumeClaimKind[]>;
  vmLikeEntityLoading?: FirehoseResult<VMLikeEntityKind>;
  vmLikeEntity: VMLikeEntityKind;
  templateValidations?: TemplateValidations;
  isVMRunning?: boolean;
  vm?: VMKind;
  vmi?: VMIKind;
};

const DiskModalFirehose: React.FC<DiskModalFirehoseProps> = (props) => {
  const { vmLikeEntity, useProjects, ...restProps } = props;

  const vmName = getName(vmLikeEntity);
  const vmNamespace = getNamespace(vmLikeEntity);

  const [namespace, setNamespace] = React.useState<string>(
    new DataVolumeWrapper(props.dataVolume).getPersistentVolumeClaimNamespace() || vmNamespace,
  );

  const resources = [
    {
      kind: (useProjects ? ProjectModel : NamespaceModel).kind,
      isList: true,
      prop: 'namespaces',
    },
    {
      kind: getVMLikeModel(vmLikeEntity).kind,
      name: vmName,
      namespace: vmNamespace,
      prop: 'vmLikeEntityLoading',
    },
    {
      kind: StorageClassModel.kind,
      isList: true,
      prop: 'storageClasses',
    },
    {
      kind: PersistentVolumeClaimModel.kind,
      isList: true,
      namespace,
      prop: 'persistentVolumeClaims',
    },
  ];

  return (
    <Firehose resources={resources}>
      <DiskModalFirehoseComponent
        vmLikeEntity={vmLikeEntity}
        namespace={namespace}
        onNamespaceChanged={(n) => setNamespace(n)}
        isTemplate={isTemplate(vmLikeEntity)}
        vm={restProps.vm}
        vmi={restProps.vmi}
        {...restProps}
      />
    </Firehose>
  );
};

type DiskModalFirehoseProps = ModalComponentProps & {
  vmLikeEntity: VMLikeEntityKind;
  disk?: any;
  volume?: any;
  dataVolume?: any;
  isEditing?: boolean;
  useProjects: boolean;
  templateValidations?: TemplateValidations;
  isTemplate?: boolean;
  isVMRunning?: boolean;
  vm?: VMKind;
  vmi?: VMIKind;
};

const diskModalStateToProps = ({ k8s }) => {
  const useProjects = k8s.hasIn(['RESOURCES', 'models', ProjectModel.kind]);
  return {
    useProjects,
  };
};

const DiskModalConnected = connectWithStore(diskModalStateToProps, DiskModalFirehose);
export const diskModalEnhanced = createModalLauncher(DiskModalConnected);

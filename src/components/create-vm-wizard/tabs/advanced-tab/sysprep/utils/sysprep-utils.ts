import { k8sCreate } from '@kubevirt-internal/utils';
import { ConfigMapModel } from '@kubevirt-models';

import { VMWrapper } from '../../../../../../k8s/wrapper/vm/vm-wrapper';
import { VMKind } from '../../../../../../types';
import { buildOwnerReference } from '../../../../../../utils';

export const SYSPREP = 'sysprep';
export const AUTOUNATTEND = 'Autounattend.xml';
export const UNATTEND = 'Unattend.xml';

export type SysprepData = { [AUTOUNATTEND]: string | null; [UNATTEND]: string | null };

export const sysprepDisk = () => ({ cdrom: { bus: 'sata' }, name: SYSPREP });

export const sysprepVolume = (vmWrapper: VMWrapper) => ({
  sysprep: {
    configMap: { name: `sysprep-config-${vmWrapper.getName()}` },
  },
  name: SYSPREP,
});

// This function should be in useSysprep hook, once advance wizard will be adjusted this can be moved.
export const createSysprepConfigMap = async (vm: VMKind, data: SysprepData) => {
  try {
    await k8sCreate(ConfigMapModel, {
      kind: ConfigMapModel.kind,
      apiVersion: ConfigMapModel.apiVersion,
      metadata: {
        name: `sysprep-config-${vm?.metadata?.name}`,
        namespace: vm?.metadata?.namespace,
        ownerReferences: [buildOwnerReference(vm, { blockOwnerDeletion: false })],
      },
      ...(data && {
        data: {
          ...(data?.[AUTOUNATTEND] && { [AUTOUNATTEND]: data?.[AUTOUNATTEND] }),
          ...(data?.[UNATTEND] && { [UNATTEND]: data?.[UNATTEND] }),
        },
      }),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e.message);
  }
};

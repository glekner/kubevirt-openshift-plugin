import { apiVersionForModel } from '@kubevirt-internal';
import { TemplateModel } from '@kubevirt-models';
import { TemplateKind } from '@kubevirt-types';

import { getName } from '../../../selectors';
import { K8sResourceWithModel } from '../../../types/k8s-resource-with-model';
import { freeOwnedResources } from '../free-owned-resources';
import { k8sKillPropagated } from '../k8s-kill-propagated';

export const deleteVMTemplate = async (
  vmTemplate: TemplateKind,
  {
    ownedVolumeResources,
    deleteOwnedVolumeResources,
  }: {
    ownedVolumeResources: K8sResourceWithModel[];
    deleteOwnedVolumeResources: boolean;
  },
) => {
  if (ownedVolumeResources && !deleteOwnedVolumeResources) {
    await freeOwnedResources(
      ownedVolumeResources,
      {
        name: getName(vmTemplate),
        kind: TemplateModel.kind,
        apiVersion: apiVersionForModel(TemplateModel),
      } as any,
      false,
    );
  }

  await k8sKillPropagated(TemplateModel, vmTemplate);
};

import * as _ from 'lodash';

import { TemplateKind } from '@kubevirt-types';

import { Patch } from '../../../k8s/helpers/patch';
import { isVM } from '../../../selectors/check-type';
import { selectVM } from '../../../selectors/vm-template/basic';
import { VMKind } from '../../../types/vm';
import { VMLikeEntityKind } from '../../../types/vmLike';

export const addPrefixToPatch = (prefix: string, patch: Patch): Patch => ({
  ...patch,
  path: `${prefix}${patch.path}`,
});

export const getTemplatePatchPrefix = (vmTemplate: TemplateKind, vm: VMKind): string => {
  const vmIndex = vmTemplate.objects.indexOf(vm);
  return vmIndex < 0 ? null : `/objects/${vmIndex}`;
};

export const getVMLikePatches = (
  vmLikeEntity: VMLikeEntityKind,
  patchesSupplier: (vm: VMKind) => Patch[],
): Patch[] => {
  let vm;
  let templatePrefix = null;
  if (isVM(vmLikeEntity)) {
    vm = vmLikeEntity;
  } else {
    vm = selectVM(vmLikeEntity as TemplateKind);
    templatePrefix = getTemplatePatchPrefix(vmLikeEntity as TemplateKind, vm);
  }

  const patches = _.compact(vm ? patchesSupplier(vm) : []);

  return templatePrefix ? patches.map((p) => addPrefixToPatch(templatePrefix, p)) : patches;
};

import { referenceForModel } from '@kubevirt-internal';
import { K8sKind, K8sResourceCommon } from '@kubevirt-types';

export type SubscriptionsKind = K8sResourceCommon & { spec: any };

export type PackageManifestKind = K8sResourceCommon & { status: any };

export type ForkLiftKind = K8sResourceCommon & { spec: any };

export const MTV_OPERATOR = 'mtv-operator';
export const MTV_ROUTE_NAME = 'forklift-ui';

export const filterMtv = (arr: any[]) =>
  arr.find(({ metadata: { name } }) => name === MTV_OPERATOR);

export const resourceBuilder = (model: K8sKind, reference = true) => ({
  kind: reference ? referenceForModel(model) : model?.kind,
  isList: true,
});

export const createInstallUrl = (operator: PackageManifestKind, namespace?: string) =>
  `/operatorhub/subscribe?pkg=${operator?.metadata?.name}&catalog=${operator?.status?.catalogSource}&catalogNamespace=${operator?.status?.catalogSourceNamespace}&targetNamespace=${namespace}`;

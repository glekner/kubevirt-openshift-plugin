import * as React from 'react';
import { Link } from 'react-router-dom';

import { getTopologyResource, ResourceIcon, resourcePathFromModel } from '@kubevirt-internal';
import {
  AdapterDataType,
  K8sResourceCommon,
  NetworkAdapterType,
  PodsAdapterDataType,
} from '@openshift-console/dynamic-plugin-sdk';
import { GraphElement } from '@patternfly/react-topology';

import { VirtualMachineModel } from '../models';
import { getKubevirtAvailableModel } from '../models/kubevirtReferenceForModel';
import { usePodsForVm } from '../utils/usePodsForVm';

import { TYPE_VIRTUAL_MACHINE } from './components/const';
import { TopologyVmDetailsPanel } from './TopologyVmDetailsPanel';
import { VMNode } from './types';

export const getVmSidePanelDetailsTabSection = (element: GraphElement) => {
  if (element.getType() !== TYPE_VIRTUAL_MACHINE) return undefined;
  return <TopologyVmDetailsPanel vmNode={element as VMNode} />;
};

const usePodsAdapterForVm = (resource: K8sResourceCommon): PodsAdapterDataType => {
  const { podData, loaded, loadError } = usePodsForVm(resource);
  return React.useMemo(
    () => ({ pods: podData?.pods ?? [], loaded, loadError }),
    [loadError, loaded, podData],
  );
};

export const getVmSidePanelPodsAdapter = (
  element: GraphElement,
): AdapterDataType<PodsAdapterDataType> => {
  if (element.getType() !== TYPE_VIRTUAL_MACHINE) return undefined;
  const resource = getTopologyResource(element);
  return { resource, provider: usePodsAdapterForVm };
};

export const getVmSidePanelNetworkAdapter = (element: GraphElement): NetworkAdapterType => {
  if (element.getType() !== TYPE_VIRTUAL_MACHINE) return undefined;
  const resource = getTopologyResource(element);
  return { resource };
};

export const getVmSideBarResourceLink = (element: GraphElement) => {
  if (element.getType() !== TYPE_VIRTUAL_MACHINE) return undefined;
  const name = element.getLabel();
  const resource = getTopologyResource(element);
  return (
    <>
      <ResourceIcon className="co-m-resource-icon--lg" kind={resource.kind} />
      {name && (
        <Link
          to={resourcePathFromModel(
            getKubevirtAvailableModel(VirtualMachineModel),
            name,
            resource.metadata.namespace,
          )}
          className="co-resource-item__resource-name"
        >
          {name}
        </Link>
      )}
    </>
  );
};

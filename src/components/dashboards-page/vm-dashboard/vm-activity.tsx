import * as React from 'react';
import { useTranslation } from 'react-i18next';

import {
  DashboardCardLink,
  RecentEventsBodyContent,
  resourcePath,
  withDashboardResources,
} from '@kubevirt-internal';
import { PauseButton } from '@kubevirt-internal/components/pause-button';
import { EventModel } from '@kubevirt-models';
import { DashboardItemProps, EventKind } from '@kubevirt-types';
import { FirehoseResource, FirehoseResult } from '@openshift-console/dynamic-plugin-sdk';
import {
  ActivityBody,
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '@openshift-console/dynamic-plugin-sdk-internal';
import { CardActions } from '@patternfly/react-core';

import { VirtualMachineInstanceModel, VirtualMachineModel } from '../../../models';
import { kubevirtReferenceForModel } from '../../../models/kubevirtReferenceForModel';
import { getName, getNamespace } from '../../../selectors';
import { getVmEventsFilters } from '../../../selectors/event';
import { VMILikeEntityKind } from '../../../types/vmLike';
import { VMDashboardContext } from '../../vms/vm-dashboard-context';

import './vm-activity.scss';

const combinedVmFilter =
  (vm: VMILikeEntityKind): EventFilterFuncion =>
  (event) =>
    getVmEventsFilters(vm).some((filter) => filter(event.involvedObject, event));

const getEventsResource = (namespace: string): FirehoseResource => ({
  isList: true,
  kind: EventModel.kind,
  prop: 'events',
  namespace,
});

const RecentEvent: any = withDashboardResources<RecentEventProps>(
  ({ watchK8sResource, stopWatchK8sResource, resources, vm, paused, setPaused }) => {
    React.useEffect(() => {
      if (vm) {
        const eventsResource = getEventsResource(getNamespace(vm));
        watchK8sResource(eventsResource);
        return () => {
          stopWatchK8sResource(eventsResource);
        };
      }
      return null;
    }, [watchK8sResource, stopWatchK8sResource, vm]);
    return (
      <RecentEventsBodyContent
        events={resources.events as FirehoseResult<EventKind[]>}
        filter={combinedVmFilter(vm)}
        paused={paused}
        setPaused={setPaused}
      />
    );
  },
);

export const VMActivityCard: React.FC = () => {
  const { t } = useTranslation();
  const { vm, vmi } = React.useContext(VMDashboardContext);
  const vmiLike = vm || vmi;

  const [paused, setPaused] = React.useState(false);
  const togglePause = React.useCallback(() => setPaused(!paused), [paused]);

  const name = getName(vmiLike);
  const namespace = getNamespace(vmiLike);
  const viewEventsLink = `${resourcePath(
    vm
      ? kubevirtReferenceForModel(VirtualMachineModel)
      : kubevirtReferenceForModel(VirtualMachineInstanceModel),
    name,
    namespace,
  )}/events`;

  return (
    <DashboardCard gradient>
      <DashboardCardHeader>
        <DashboardCardTitle>{t('kubevirt-plugin~Events')}</DashboardCardTitle>
        <CardActions className="kubevirt-activity-card__actions">
          <DashboardCardLink to={viewEventsLink}>{t('kubevirt-plugin~View all')}</DashboardCardLink>
          <PauseButton paused={paused} togglePause={togglePause} />
        </CardActions>
      </DashboardCardHeader>
      <DashboardCardBody>
        <ActivityBody>
          <RecentEvent vm={vmiLike} paused={paused} setPaused={setPaused} />
        </ActivityBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

type EventFilterFuncion = (event: EventKind) => boolean;

type RecentEventProps = DashboardItemProps & {
  vm: VMILikeEntityKind;
  paused: boolean;
  setPaused: (paused: boolean) => void;
};

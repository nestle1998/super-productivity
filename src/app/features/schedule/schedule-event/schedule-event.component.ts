import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ScheduleEvent } from '../schedule.model';
import { TimelineViewEntryType } from '../../timeline/timeline.const';
import { MatIcon } from '@angular/material/icon';
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectProjectById } from '../../project/store/project.selectors';
import { BaseComponent } from '../../../core/base-component/base.component';

@Component({
  selector: 'schedule-event',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './schedule-event.component.html',
  styleUrl: './schedule-event.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleEventComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input({ required: true })
  set event(event: ScheduleEvent) {
    this.se = event;
  }

  se!: ScheduleEvent;

  @HostBinding('class') get cssClass(): string {
    // console.log('CLASS');

    let addClass = '';
    if (this.isSplitContinued) {
      addClass = 'split-continued';
    } else if (this.isSplitContinuedLast) {
      addClass = 'split-continued-last';
    } else if (this.isSplitStart) {
      addClass = 'split-start';
    }

    return this.se?.type + '  ' + addClass;
  }

  @HostBinding('style') get style(): string {
    return this.se?.style;
  }

  get isSplitStart(): boolean {
    return (
      this.se?.type === TimelineViewEntryType.SplitTask ||
      this.se?.type === TimelineViewEntryType.RepeatProjectionSplit ||
      this.se?.type === TimelineViewEntryType.SplitTaskPlannedForDay
    );
  }

  get isSplitContinued(): boolean {
    return (
      this.se?.type === TimelineViewEntryType.SplitTaskContinued ||
      this.se?.type === TimelineViewEntryType.RepeatProjectionSplitContinued
    );
  }

  get isSplitContinuedLast(): boolean {
    return (
      this.se?.type === TimelineViewEntryType.SplitTaskContinuedLast ||
      this.se?.type === TimelineViewEntryType.RepeatProjectionSplitContinuedLast
    );
  }

  get icoType():
    | 'REPEAT'
    | 'FLOW'
    | 'SCHEDULED_TASK'
    | 'PLANNED_FOR_DAY'
    | 'CAL_PROJECTION'
    | 'SPLIT_CONTINUE'
    | 'LUNCH_BREAK' {
    switch (this.se?.type) {
      case TimelineViewEntryType.RepeatProjection:
      case TimelineViewEntryType.RepeatProjectionSplit: {
        return 'REPEAT';
      }
      case TimelineViewEntryType.TaskPlannedForDay:
      case TimelineViewEntryType.SplitTaskPlannedForDay: {
        return 'PLANNED_FOR_DAY';
      }
      case TimelineViewEntryType.Task:
      case TimelineViewEntryType.SplitTask: {
        return 'FLOW';
      }
      case TimelineViewEntryType.CalendarEvent: {
        return 'CAL_PROJECTION';
      }
      case TimelineViewEntryType.ScheduledTask: {
        return 'SCHEDULED_TASK';
      }
      case TimelineViewEntryType.LunchBreak: {
        return 'LUNCH_BREAK';
      }
    }
    return 'SPLIT_CONTINUE';
  }

  protected readonly TimelineViewEntryType = TimelineViewEntryType;

  constructor(
    private _store: Store,
    private _elRef: ElementRef,
  ) {
    super();
  }

  ngOnInit(): void {
    const pid = (this.se?.data as any)?.projectId;

    if (pid) {
      this._store
        .select(selectProjectById, { id: pid })
        .pipe(takeUntil(this.onDestroy$))
        .subscribe((p) => {
          console.log('SET COLOR');

          this._elRef.nativeElement.style.setProperty('--project-color', p.theme.primary);
        });
    }
  }
}

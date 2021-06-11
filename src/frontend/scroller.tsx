import { RefObject } from 'react';
import { Subject } from 'rxjs';

export interface ScrollPosition {
  start: number;
  end: number;
}

export class Scroller {
  readonly COUNT: number;
  private start: number;
  private end: number;
  private directoryLength: number;
  private pinToBottom: boolean;
  private subject: Subject<ScrollPosition>;
  private init: boolean;
  private scrollLimit: number;
  private ref: RefObject<HTMLUListElement>;

  constructor(count: number, limit: number, subject: Subject<ScrollPosition>, length: number) {
    this.COUNT = count;
    this.start = 0;
    this.end = count;
    this.directoryLength = length || 0;
    this.pinToBottom = false;
    this.subject = subject;
    this.init = false;
    this.scrollLimit = limit;
  }

  register(ref: any) {
    this.ref = ref;
    ref.current.addEventListener('scroll', (event: Event) => this.handleScroll(event));
  };

  unregister(ref: any) {
    this.ref = ref;
    ref.current.removeEventListener('scroll', (event: Event) => this.handleScroll(event));
  };

  didUpdate() {
    if (!this.pinToBottom && this.ref) {
      this.ref.current.scrollTop = 20;
    }
  };

  handleScroll(event: any) {
    // skip the initial scrollTop assignment
    if (!this.init) {
      this.init = true;
      return;
    }

    if (!this.directoryLength) {
      return;
    }

    let scrollTop = event.srcElement.scrollTop;

    if (scrollTop > this.scrollLimit) {

      if (scrollTop < this.scrollLimit + 20) {
	return;
      }

      const delta = Math.ceil((scrollTop - this.scrollLimit) / (this.scrollLimit * 2));

      if (this.start === 0) {
	this.start = 1;
      } else {

	this.start += delta;
	this.end = this.start + this.COUNT;

	if (this.end >= this.directoryLength) {
	  this.pinToBottom = true;
	  this.start = this.directoryLength - this.COUNT;
	  this.end = this.directoryLength;
	}
      }
    }
    else if (scrollTop < this.scrollLimit) {
      if (scrollTop > this.scrollLimit - 20 || this.start === 0) {
	return;
      }

      this.pinToBottom = false;

      this.start--;
      this.end = this.start + this.COUNT;
    }

    this.subject.next({
      start: this.start,
      end: this.end,
    });

  }
}

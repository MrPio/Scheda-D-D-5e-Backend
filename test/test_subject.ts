import { Subject } from "rxjs";

const subject = new Subject<string>();

const subscription1 = subject.subscribe(value => {
  console.log('First function received:', value);
});

subject.next('Hello');
subject.unsubscribe();

const subscription2 = subject.subscribe(value => {
  console.log('Second function received:', value);
});

subject.next('World');
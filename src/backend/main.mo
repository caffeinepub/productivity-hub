import List "mo:core/List";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

actor {
  type Task = {
    id : Nat;
    title : Text;
    priority : Priority;
    dueDate : ?Int;
    completed : Bool;
  };

  type Priority = {
    #high;
    #medium;
    #low;
  };

  type Note = {
    id : Nat;
    title : Text;
    content : Text;
  };

  type Habit = {
    id : Nat;
    name : Text;
    color : Text;
    createdAt : Int;
    completionDates : List.List<Int>;
    streak : Nat;
  };

  type HabitView = {
    id : Nat;
    name : Text;
    color : Text;
    createdAt : Int;
    completionDates : [Int];
    streak : Nat;
  };

  type Pomodoro = {
    timestamp : Int;
    duration : Nat;
  };

  type QuickLink = {
    id : Nat;
    title : Text;
    url : Text;
    emoji : Text;
  };

  type UserData = {
    tasks : List.List<Task>;
    notes : List.List<Note>;
    habits : List.List<Habit>;
    pomodoros : List.List<Pomodoro>;
    quickLinks : List.List<QuickLink>;
    nextTaskId : Nat;
    nextNoteId : Nat;
    nextHabitId : Nat;
    nextQuickLinkId : Nat;
  };

  type PomodoroStats = {
    today : Nat;
    allTime : Nat;
  };

  type UserDataView = {
    tasks : [Task];
    notes : [Note];
    habits : [HabitView];
    pomodoros : [Pomodoro];
    quickLinks : [QuickLink];
    nextTaskId : Nat;
    nextNoteId : Nat;
    nextHabitId : Nat;
    nextQuickLinkId : Nat;
  };

  module Task {
    public func compare(task1 : Task, task2 : Task) : Order.Order {
      Nat.compare(task1.id, task2.id);
    };
  };

  module Note {
    public func compare(note1 : Note, note2 : Note) : Order.Order {
      Nat.compare(note1.id, note2.id);
    };
  };

  module Habit {
    public func compare(habit1 : Habit, habit2 : Habit) : Order.Order {
      Nat.compare(habit1.id, habit2.id);
    };
  };

  module Pomodoro {
    public func compare(pomodoro1 : Pomodoro, pomodoro2 : Pomodoro) : Order.Order {
      Int.compare(pomodoro1.timestamp, pomodoro2.timestamp);
    };
  };

  module QuickLink {
    public func compare(quickLink1 : QuickLink, quickLink2 : QuickLink) : Order.Order {
      Nat.compare(quickLink1.id, quickLink2.id);
    };
  };

  let users = Map.empty<Principal, UserData>();

  func getUser(caller : Principal) : UserData {
    switch (users.get(caller)) {
      case (null) { createUser(caller) };
      case (?userData) { userData };
    };
  };

  func createUser(caller : Principal) : UserData {
    if (users.containsKey(caller)) { Runtime.trap("User already exists!") };
    let newUser : UserData = {
      tasks = List.empty<Task>();
      notes = List.empty<Note>();
      habits = List.empty<Habit>();
      pomodoros = List.empty<Pomodoro>();
      quickLinks = List.empty<QuickLink>();
      nextTaskId = 1;
      nextNoteId = 1;
      nextHabitId = 1;
      nextQuickLinkId = 1;
    };
    users.add(caller, newUser);
    newUser;
  };

  public shared ({ caller }) func createTask(title : Text, priority : Priority, dueDate : ?Int) : async Task {
    let userData = getUser(caller);
    let task : Task = {
      id = userData.nextTaskId;
      title;
      priority;
      dueDate;
      completed = false;
    };
    userData.tasks.add(task);
    users.add(
      caller,
      {
        userData with
        nextTaskId = userData.nextTaskId + 1;
      },
    );
    task;
  };

  public shared ({ caller }) func toggleTaskCompletion(id : Nat) : async () {
    let userData = getUser(caller);
    let tasks = userData.tasks.map<Task, Task>(
      func(task) {
        if (task.id == id) { { task with completed = not task.completed } } else { task };
      }
    );
    users.add(caller, { userData with tasks });
  };

  public shared ({ caller }) func deleteTask(id : Nat) : async () {
    let userData = getUser(caller);
    let filteredTasks = userData.tasks.filter(func(task) { task.id != id });
    users.add(caller, { userData with tasks = filteredTasks });
  };

  public query ({ caller }) func getTasks() : async [Task] {
    let userData = getUser(caller);
    userData.tasks.toArray().sort();
  };

  public shared ({ caller }) func createNote(title : Text, content : Text) : async Note {
    let userData = getUser(caller);
    let note : Note = {
      id = userData.nextNoteId;
      title;
      content;
    };
    userData.notes.add(note);
    users.add(
      caller,
      {
        userData with
        nextNoteId = userData.nextNoteId + 1;
      },
    );
    note;
  };

  public shared ({ caller }) func updateNote(id : Nat, title : Text, content : Text) : async () {
    let userData = getUser(caller);
    let notes = userData.notes.map<Note, Note>(
      func(note) {
        if (note.id == id) { { note with title; content } } else { note };
      }
    );
    users.add(caller, { userData with notes });
  };

  public shared ({ caller }) func deleteNote(id : Nat) : async () {
    let userData = getUser(caller);
    let filteredNotes = userData.notes.filter(func(note) { note.id != id });
    users.add(caller, { userData with notes = filteredNotes });
  };

  public query ({ caller }) func getNotes() : async [Note] {
    let userData = getUser(caller);
    userData.notes.toArray().sort();
  };

  func habitToView(habit : Habit) : HabitView {
    {
      habit with
      completionDates = habit.completionDates.toArray();
    };
  };

  func convertToHabitViewArray(habitList : List.List<Habit>) : [HabitView] {
    habitList.values().map(habitToView).toArray();
  };

  public shared ({ caller }) func createHabit(name : Text, color : Text) : async HabitView {
    let userData = getUser(caller);
    let habit : Habit = {
      id = userData.nextHabitId;
      name;
      color;
      createdAt = Time.now();
      completionDates = List.empty<Int>();
      streak = 0;
    };
    userData.habits.add(habit);
    users.add(
      caller,
      {
        userData with
        nextHabitId = userData.nextHabitId + 1;
      },
    );
    habitToView(habit);
  };

  public shared ({ caller }) func deleteHabit(id : Nat) : async () {
    let userData = getUser(caller);
    let filteredHabits = userData.habits.filter(func(habit) { habit.id != id });
    users.add(caller, { userData with habits = filteredHabits });
  };

  public shared ({ caller }) func toggleHabitCompletion(habitId : Nat) : async () {
    let userData = getUser(caller);
    let currentTime = Time.now();
    let habits = userData.habits.map<Habit, Habit>(
      func(habit) {
        if (habit.id == habitId) {
          let cleanedDates = habit.completionDates.filter(
            func(date) {
              let isToday = date / 86400000000000 == currentTime / 86400000000000;
              not isToday;
            }
          );
          let updatedDates = cleanedDates;
          updatedDates.add(currentTime);
          if (updatedDates.size() > 0) {
            { habit with completionDates = updatedDates };
          } else {
            let updatedStreak = calculateStreak(habit.completionDates, currentTime);
            {
              habit with
              completionDates = habit.completionDates;
              streak = updatedStreak;
            };
          };
        } else {
          habit;
        };
      }
    );
    users.add(caller, { userData with habits });
  };

  func calculateStreak(completionDates : List.List<Int>, currentTime : Int) : Nat {
    var streak = 0;
    var dayOffset = 0;
    var checking = true;
    let reversedDates = completionDates.toArray().reverse();
    for (date in reversedDates.values()) {
      let dayDiff = (currentTime / 86400000000000) - dayOffset;
      let dateDay = date / 86400000000000 + dayOffset;
      switch (Int.compare(dayDiff, dateDay)) {
        case (#equal) {
          streak += 1;
          dayOffset += 1;
        };
        case (_) { checking := false };
      };
    };
    streak;
  };

  public query ({ caller }) func getHabits() : async [HabitView] {
    let userData = getUser(caller);
    convertToHabitViewArray(userData.habits);
  };

  public shared ({ caller }) func logPomodoro(duration : Nat) : async () {
    let userData = getUser(caller);
    let pomodoro : Pomodoro = {
      timestamp = Time.now();
      duration;
    };
    userData.pomodoros.add(pomodoro);
    users.add(caller, userData);
  };

  public query ({ caller }) func getPomodoroStats() : async PomodoroStats {
    let now = Time.now();
    let userData = getUser(caller);
    var todayTotal : Nat = 0;
    var allTimeTotal : Nat = 0;

    for (pomodoro in userData.pomodoros.values()) {
      allTimeTotal += pomodoro.duration;
      if (pomodoro.timestamp / 86400000000000 == now / 86400000000000) {
        todayTotal += pomodoro.duration;
      };
    };

    {
      today = todayTotal;
      allTime = allTimeTotal;
    };
  };

  public shared ({ caller }) func addQuickLink(title : Text, url : Text, emoji : Text) : async QuickLink {
    let userData = getUser(caller);
    let quickLink : QuickLink = {
      id = userData.nextQuickLinkId;
      title;
      url;
      emoji;
    };
    userData.quickLinks.add(quickLink);
    users.add(
      caller,
      {
        userData with
        nextQuickLinkId = userData.nextQuickLinkId + 1;
      },
    );
    quickLink;
  };

  public shared ({ caller }) func deleteQuickLink(id : Nat) : async () {
    let userData = getUser(caller);
    let filteredLinks = userData.quickLinks.filter(func(link) { link.id != id });
    users.add(caller, { userData with quickLinks = filteredLinks });
  };

  public query ({ caller }) func getQuickLinks() : async [QuickLink] {
    let userData = getUser(caller);
    userData.quickLinks.toArray();
  };

  public query ({ caller }) func getUserData() : async UserDataView {
    let userData = getUser(caller);
    {
      tasks = userData.tasks.toArray();
      notes = userData.notes.toArray();
      habits = convertToHabitViewArray(userData.habits);
      pomodoros = userData.pomodoros.toArray();
      quickLinks = userData.quickLinks.toArray();
      nextTaskId = userData.nextTaskId;
      nextNoteId = userData.nextNoteId;
      nextHabitId = userData.nextHabitId;
      nextQuickLinkId = userData.nextQuickLinkId;
    };
  };
};

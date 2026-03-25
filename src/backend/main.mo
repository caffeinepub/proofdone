import Map "mo:core/Map";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Nat64 "mo:core/Nat64";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  // Type Definitions
  type TaskId = Nat;
  type TaskStatus = { #pending; #locked; #completed };

  // Task Structure
  type Task = {
    id : TaskId;
    title : Text;
    description : Text;
    durationMinutes : Nat;
    status : TaskStatus;
    createdAt : Int;
    completedAt : ?Int;
    proofText : ?Text;
    proofImage : ?Storage.ExternalBlob;
    owner : Principal;
  };

  module Task {
    public func compare(a : Task, b : Task) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // Actor State
  var taskIdCounter : TaskId = 0;
  let tasks = Map.empty<TaskId, Task>();
  let completedTaskIds = Set.empty<TaskId>();
  let lockedTaskIds = Set.empty<TaskId>();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper Functions
  func getNewTaskId() : TaskId {
    let id = taskIdCounter;
    taskIdCounter += 1;
    id;
  };

  func getTaskInternal(taskId : TaskId) : Task {
    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) { task };
    };
  };

  // Helper: Require user role
  func requireUser(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can perform this action");
    };
  };

  // Helper: Require ownership
  func requireOwnership(caller : Principal, task : Task) {
    if (task.owner != caller) {
      Runtime.trap("Not authorized");
    };
  };

  // Public API

  // Create new task
  public shared ({ caller }) func createTask(title : Text, description : Text, durationMinutes : Nat) : async TaskId {
    requireUser(caller);
    let taskId = getNewTaskId();
    let task : Task = {
      id = taskId;
      title;
      description;
      durationMinutes;
      status = #pending;
      createdAt = Time.now();
      completedAt = null;
      proofText = null;
      proofImage = null;
      owner = caller;
    };
    tasks.add(taskId, task);
    taskId;
  };

  // Start focus session (lock task)
  public shared ({ caller }) func startFocusSession(taskId : TaskId) : async () {
    requireUser(caller);
    let task = getTaskInternal(taskId);
    requireOwnership(caller, task);
    switch (task.status) {
      case (#locked) { Runtime.trap("Task already locked") };
      case (#completed) { Runtime.trap("Task already completed") };
      case (#pending) {
        tasks.add(taskId, { task with status = #locked });
        lockedTaskIds.add(taskId);
      };
    };
  };

  // Submit proof and complete task
  public shared ({ caller }) func submitProof(taskId : TaskId, proofText : ?Text, proofImage : ?Storage.ExternalBlob) : async () {
    requireUser(caller);
    let task = getTaskInternal(taskId);
    requireOwnership(caller, task);
    switch (task.status) {
      case (#pending) { Runtime.trap("Task must be locked first") };
      case (#completed) { Runtime.trap("Task already completed") };
      case (#locked) {
        let completedTask : Task = {
          task with
          status = #completed;
          completedAt = ?Time.now();
          proofText;
          proofImage;
        };
        tasks.add(taskId, completedTask);
        completedTaskIds.add(taskId);
      };
    };
  };

  // Get all tasks for caller
  public query ({ caller }) func getMyTasks() : async [Task] {
    requireUser(caller);
    tasks.values().toArray().sort().filter(func(task) { task.owner == caller });
  };

  // Get completed task IDs for caller
  public query ({ caller }) func getCompletedTaskIds() : async [TaskId] {
    requireUser(caller);
    tasks.values().toArray().filter(
      func(task) {
        task.owner == caller and task.status == #completed
      }
    ).map(func(task) { task.id });
  };

  // Get locked task IDs for caller
  public query ({ caller }) func getLockedTaskIds() : async [TaskId] {
    requireUser(caller);
    tasks.values().toArray().filter(
      func(task) {
        task.owner == caller and task.status == #locked
      }
    ).map(func(task) { task.id });
  };

  // Get single task by ID
  public query ({ caller }) func getTask(taskId : TaskId) : async ?Task {
    requireUser(caller);
    switch (tasks.get(taskId)) {
      case (null) { null };
      case (?task) {
        requireOwnership(caller, task);
        ?task;
      };
    };
  };

  // Get tasks by created time range
  public query ({ caller }) func getTasksByTimeRange(startTime : Int, endTime : Int) : async [Task] {
    requireUser(caller);
    tasks.values().toArray().sort().filter(
      func(task) {
        task.owner == caller and task.createdAt >= startTime and task.createdAt <= endTime
      }
    );
  };

  // Get all pending tasks for caller
  public query ({ caller }) func getPendingTasks() : async [Task] {
    requireUser(caller);
    tasks.values().toArray().filter(
      func(task) {
        task.owner == caller and task.status == #pending;
      }
    );
  };

  // Get all completed tasks for caller
  public query ({ caller }) func getCompletedTasks() : async [Task] {
    requireUser(caller);
    tasks.values().toArray().filter(
      func(task) {
        task.owner == caller and task.status == #completed;
      }
    );
  };

  // Delete task
  public shared ({ caller }) func deleteTask(taskId : TaskId) : async () {
    requireUser(caller);
    let task = getTaskInternal(taskId);
    requireOwnership(caller, task);
    tasks.remove(taskId);
  };
};

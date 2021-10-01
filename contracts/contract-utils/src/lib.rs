use near_sdk::{env, PromiseResult};

pub fn is_promise_success(num_of_promises: Option<u64>) -> bool {
  let count = env::promise_results_count();
  if num_of_promises.map_or(false, |num| num != count) {
      return false;
  }
  for i in 0..count {
      match env::promise_result(i) {
          PromiseResult::Successful(_) => (),
          _ => return false,
      }
  }
  true
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}

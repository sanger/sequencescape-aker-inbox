import { shallowMount } from '@vue/test-utils';
import CompletedJobs from '@/components/CompletedJobs';

describe('CompletedJobs.vue', () => {
  it('has a name', () => {
    expect(CompletedJobs.name).to.equal('completed-jobs');
  });

  it('has data', () => {
    expect(CompletedJobs.data).to.be.a('function');
  });

  it('has a title', () => {
    const wrapper = shallowMount(CompletedJobs);
    wrapper.setData({ totalCompletedJobs: 12 });
    expect(wrapper.html()).to.contain('Completed jobs (12)');
  });

  it('has a table', () => {
    const wrapper = shallowMount(CompletedJobs);
    expect(wrapper.contains('#jobs-completed-table')).to.eq(true);
  });

  it('has set data defined', () => {
    const wrapper = shallowMount(CompletedJobs);

    expect(wrapper.vm.fields.length).to.eq(12);
    expect(wrapper.vm.isBusy).to.equal(false);
    expect(wrapper.vm.currentPage).to.equal(1);
    expect(wrapper.vm.perPage).to.equal(8);
    expect(wrapper.vm.totalCompletedJobs).to.equal(0);
    expect(wrapper.vm.sortBy).to.equal('date-requested');
    expect(wrapper.vm.sortDesc).to.equal(false);
    expect(wrapper.vm.items).to.be.a('array');
    expect(wrapper.vm.detailedItems).to.be.a('object');
  });
});

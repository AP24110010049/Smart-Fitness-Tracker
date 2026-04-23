import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['general', 'running', 'cycling', 'weight-training', 'yoga'];
const CHALLENGE_TYPES = ['calories', 'duration', 'distance', 'workouts'];

export default function Community() {
  const { user } = useAuth();
  const [tab, setTab] = useState('groups');
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [groupForm, setGroupForm] = useState({ groupName: '', description: '', category: 'general' });
  const [challengeForm, setChallengeForm] = useState({ challengeName: '', description: '', type: 'workouts', target: '', startDate: '', endDate: '' });
  const [actionMsg, setActionMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [g, mg, c] = await Promise.all([
        api.get('/groups'),
        api.get('/groups/mine'),
        api.get('/challenges'),
      ]);
      setGroups(g.data);
      setMyGroups(mg.data);
      setChallenges(c.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const notify = (msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); };

  const isMember = (group) => group.members?.some(m => (m._id || m) === user?.id);

  const joinGroup = async (id) => {
    try {
      await api.post(`/groups/${id}/join`);
      notify('Joined group!');
      load();
    } catch (err) {
      notify(err.response?.data?.message || 'Error');
    }
  };

  const leaveGroup = async (id) => {
    try {
      await api.post(`/groups/${id}/leave`);
      notify('Left group');
      load();
    } catch (err) {
      notify(err.response?.data?.message || 'Error');
    }
  };

  const joinChallenge = async (id) => {
    try {
      await api.post(`/challenges/${id}/join`);
      notify('Joined challenge!');
      load();
    } catch (err) {
      notify(err.response?.data?.message || 'Error');
    }
  };

  const updateProgress = async (id) => {
    try {
      await api.post(`/challenges/${id}/progress`);
      notify('Progress updated!');
      load();
    } catch (err) {
      notify(err.response?.data?.message || 'Error');
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/groups', groupForm);
      notify('Group created!');
      setShowCreateGroup(false);
      setGroupForm({ groupName: '', description: '', category: 'general' });
      load();
    } catch (err) {
      notify(err.response?.data?.message || 'Error');
    }
  };

  const createChallenge = async (e) => {
    e.preventDefault();
    try {
      await api.post('/challenges', { ...challengeForm, target: Number(challengeForm.target) });
      notify('Challenge created!');
      setShowCreateChallenge(false);
      setChallengeForm({ challengeName: '', description: '', type: 'workouts', target: '', startDate: '', endDate: '' });
      load();
    } catch (err) {
      notify(err.response?.data?.message || 'Error');
    }
  };

  const categoryIcons = { general: '🌟', running: '🏃', cycling: '🚴', 'weight-training': '🏋️', yoga: '🧘' };
  const typeLabels = { calories: 'Calories (kcal)', duration: 'Duration (min)', distance: 'Distance (km)', workouts: 'Workouts' };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">COMMUNITY</h1>
        <p className="text-gray-400 mt-1">Connect, compete, and grow together</p>
      </div>

      {actionMsg && (
        <div className="p-3 bg-primary-500/10 border border-primary-500/30 rounded-xl text-primary-400 text-sm">{actionMsg}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-dark-600 pb-0">
        {[['groups', '👥 Groups'], ['challenges', '🏆 Challenges']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${tab === key ? 'border-primary-500 text-primary-400' : 'border-transparent text-gray-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : tab === 'groups' ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => setShowCreateGroup(!showCreateGroup)} className="btn-primary flex items-center gap-2">
              + Create Group
            </button>
          </div>

          {showCreateGroup && (
            <div className="card border-primary-500/30">
              <h3 className="font-semibold text-white mb-4">Create New Group</h3>
              <form onSubmit={createGroup} className="space-y-4">
                <div><label className="label">Group Name</label><input className="input" value={groupForm.groupName} onChange={e => setGroupForm(f => ({ ...f, groupName: e.target.value }))} placeholder="Morning Runners" required /></div>
                <div><label className="label">Description</label><textarea className="input resize-none h-20" value={groupForm.description} onChange={e => setGroupForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this group about?" /></div>
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={groupForm.category} onChange={e => setGroupForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary">Create Group</button>
                  <button type="button" onClick={() => setShowCreateGroup(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {groups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map(group => {
                const member = isMember(group);
                return (
                  <div key={group._id} className={`card hover:border-primary-500/30 transition-all ${member ? 'border-primary-500/20 bg-primary-500/5' : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{categoryIcons[group.category] || '🌟'}</span>
                      {member && <span className="badge bg-primary-500/20 text-primary-400 text-xs">Joined</span>}
                    </div>
                    <h3 className="font-semibold text-white">{group.groupName}</h3>
                    {group.description && <p className="text-gray-400 text-sm mt-1 line-clamp-2">{group.description}</p>}
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-gray-500 text-xs">👥 {group.members?.length || 0} members</span>
                      <button onClick={() => member ? leaveGroup(group._id) : joinGroup(group._id)}
                        className={member ? 'btn-danger text-xs px-3 py-1.5' : 'btn-primary text-xs px-3 py-1.5'}>
                        {member ? 'Leave' : 'Join'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card py-16 text-center text-gray-500">
              <p className="text-4xl mb-3">👥</p>
              <p>No groups yet. Be the first to create one!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => setShowCreateChallenge(!showCreateChallenge)} className="btn-primary flex items-center gap-2">
              + Create Challenge
            </button>
          </div>

          {showCreateChallenge && (
            <div className="card border-primary-500/30">
              <h3 className="font-semibold text-white mb-4">Create New Challenge</h3>
              <form onSubmit={createChallenge} className="space-y-4">
                <div><label className="label">Challenge Name</label><input className="input" value={challengeForm.challengeName} onChange={e => setChallengeForm(f => ({ ...f, challengeName: e.target.value }))} placeholder="30-Day Calorie Burn" required /></div>
                <div><label className="label">Description</label><textarea className="input resize-none h-16" value={challengeForm.description} onChange={e => setChallengeForm(f => ({ ...f, description: e.target.value }))} placeholder="Challenge description..." /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Type</label>
                    <select className="input" value={challengeForm.type} onChange={e => setChallengeForm(f => ({ ...f, type: e.target.value }))}>
                      {CHALLENGE_TYPES.map(t => <option key={t} value={t}>{typeLabels[t]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Target ({typeLabels[challengeForm.type]})</label>
                    <input className="input" type="number" value={challengeForm.target} onChange={e => setChallengeForm(f => ({ ...f, target: e.target.value }))} placeholder="5000" required min="1" />
                  </div>
                  <div>
                    <label className="label">Start Date</label>
                    <input className="input" type="date" value={challengeForm.startDate} onChange={e => setChallengeForm(f => ({ ...f, startDate: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="label">End Date</label>
                    <input className="input" type="date" value={challengeForm.endDate} onChange={e => setChallengeForm(f => ({ ...f, endDate: e.target.value }))} required />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary">Create Challenge</button>
                  <button type="button" onClick={() => setShowCreateChallenge(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {challenges.length > 0 ? (
            <div className="space-y-4">
              {challenges.map(challenge => {
                const joined = challenge.participants?.some(p => (p.userId?._id || p.userId) === user?.id);
                const myEntry = challenge.leaderboard?.find(l => (l.userId?._id || l.userId) === user?.id);
                const pct = challenge.target > 0 ? Math.min(100, Math.round(((myEntry?.score || 0) / challenge.target) * 100)) : 0;
                return (
                  <div key={challenge._id} className="card">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-white">{challenge.challengeName}</h3>
                          <span className="badge bg-blue-500/20 text-blue-400">{typeLabels[challenge.type]}</span>
                          {joined && <span className="badge bg-primary-500/20 text-primary-400">Joined</span>}
                        </div>
                        {challenge.description && <p className="text-gray-400 text-sm mt-1">{challenge.description}</p>}
                        <p className="text-gray-500 text-xs mt-1 font-mono">
                          {new Date(challenge.startDate).toLocaleDateString()} → {new Date(challenge.endDate).toLocaleDateString()} • Target: {challenge.target} {typeLabels[challenge.type]}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {joined && <button onClick={() => updateProgress(challenge._id)} className="btn-secondary text-sm">Sync Progress</button>}
                        {!joined && <button onClick={() => joinChallenge(challenge._id)} className="btn-primary text-sm">Join</button>}
                      </div>
                    </div>

                    {joined && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">My Progress</span>
                          <span className="text-primary-400 font-mono">{myEntry?.score || 0} / {challenge.target} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Leaderboard */}
                    {challenge.leaderboard?.length > 0 && (
                      <div className="mt-4 border-t border-dark-600 pt-4">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Leaderboard</p>
                        <div className="space-y-2">
                          {challenge.leaderboard.slice(0, 5).map((entry, i) => (
                            <div key={i} className={`flex items-center justify-between text-sm p-2 rounded-lg ${(entry.userId?._id || entry.userId) === user?.id ? 'bg-primary-500/10 border border-primary-500/20' : 'bg-dark-700'}`}>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold font-mono w-6 text-center ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-700' : 'text-gray-500'}`}>
                                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                </span>
                                <span className="text-white">{entry.userId?.name || 'User'}</span>
                              </div>
                              <span className="text-primary-400 font-mono">{entry.score}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card py-16 text-center text-gray-500">
              <p className="text-4xl mb-3">🏆</p>
              <p>No challenges yet. Create the first one!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

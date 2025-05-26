const supabase = window.supabase.createClient(
  'https://glqmrfyvhvzfbaqvcawy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdscW1yZnl2aHZ6ZmJhcXZjYXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMjU4MDIsImV4cCI6MjA2MjkwMTgwMn0.vBgO9ZOdDnI4crjEjAZ7Ptabw-zLwbzzlHavE5u05hM'
);

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const authSection = document.getElementById('auth-section');
const notesSection = document.getElementById('notes-section');
const noteText = document.getElementById('note-text');
const notesList = document.getElementById('notes-list');

async function signUp() {
  const { error } = await supabase.auth.signUp({
    email: emailInput.value,
    password: passwordInput.value
  });
  if (error) alert(error.message);
  else alert("Signup successful! Check your email.");
}

async function signIn() {
  const { error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value
  });
  if (error) alert(error.message);
  else loadNotes();
}

async function signOut() {
  await supabase.auth.signOut();
  authSection.style.display = 'block';
  notesSection.style.display = 'none';
}

async function addNote() {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return;

  const { error } = await supabase
    .from('notes')
    .insert({ content: noteText.value, user_id: user.id });

  if (!error) {
    noteText.value = '';
    loadNotes();
  }
}

async function deleteNote(id) {
  await supabase.from('notes').delete().eq('id', id);
  loadNotes();
}

async function loadNotes() {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return;

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    alert(error.message);
    return;
  }

  authSection.style.display = 'none';
  notesSection.style.display = 'block';
  notesList.innerHTML = '';

  data.forEach(note => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${note.content}
      <button onclick="deleteNote(${note.id})">Delete</button>
    `;
    notesList.appendChild(li);
  });
}

// Auto-login on page load
supabase.auth.getSession().then(({ data }) => {
  if (data.session) loadNotes();
});

supabase.auth.onAuthStateChange((_event, session) => {
  if (session) loadNotes();
});
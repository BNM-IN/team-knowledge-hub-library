-- Appendix A categories and the default + sample groups (Appendix C).
insert into categories (name, sort_order) values
  ('LLM Basics', 1), ('Prompting', 2), ('RAG', 3), ('Agents', 4),
  ('Fine-tuning', 5), ('Evaluation', 6), ('Tools & Platforms', 7), ('Other', 8)
on conflict (name) do nothing;

insert into groups (name, topic, description, join_code, is_default)
values ('Community', 'Everyone, every topic', 'The group every NoteHive member starts in.', 'CMTY42', true)
on conflict do nothing;

insert into groups (name, topic, description, join_code)
values
  ('RAG study group', 'Retrieval-augmented generation', 'Notes on chunking, embeddings, retrieval and rerankers.', 'K7Q2MX'),
  ('Agents deep-dive', 'Tool use and planning', 'How tool-calling agents plan, act and recover.', 'AGNT7P')
on conflict do nothing;

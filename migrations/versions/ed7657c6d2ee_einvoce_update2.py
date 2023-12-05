"""Einvoce update2.

Revision ID: ed7657c6d2ee
Revises: dbed9a983dbb
Create Date: 2023-12-05 12:08:30.405634

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ed7657c6d2ee'
down_revision = 'dbed9a983dbb'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('einvoice_row',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('einvoice_id', sa.Integer(), nullable=False),
    sa.Column('npp', sa.Integer(), nullable=False),
    sa.Column('item_id', sa.Integer(), nullable=False),
    sa.Column('quantity', sa.Float(), nullable=False),
    sa.Column('price', sa.Float(), nullable=False),
    sa.ForeignKeyConstraint(['einvoice_id'], ['einvoice.num_doc'], name='fk_einvoice_num_doc'),
    sa.ForeignKeyConstraint(['item_id'], ['item.id'], name='fk_einvoice_row_item'),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('einvoice_row')
    # ### end Alembic commands ###

"""GroupItem.

Revision ID: c751abe939b0
Revises: 1b6bab5eeb7e
Create Date: 2023-12-22 11:53:07.389087

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c751abe939b0'
down_revision = '1b6bab5eeb7e'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('group_item',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('group_name', sa.String(length=50), nullable=False),
    sa.Column('group_description', sa.String(length=150), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('group_item')
    # ### end Alembic commands ###